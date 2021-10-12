import { Inject, Injectable } from '@nestjs/common';
import { IherbProductInfo, IherbService } from 'src/iherb/iherb.service';
import { Telegraf, Scenes, Markup, Composer, session, Context } from 'telegraf';
import { MESSAGES, TELEGRAM_MODULE_OPTIONS } from './telegram.constants';
import { ItelegramOptions } from './telegram.interface';

interface ExtendedSession extends Scenes.WizardSession {
  // will be available under `ctx.session.mySessionProp`
  isLoading: boolean;
  cart: IherbProductInfo[];
  shipment: string;
}

interface ExtendedContext extends Context {
  isLoading: boolean;
  session: ExtendedSession;
  scene: Scenes.SceneContextScene<ExtendedContext, Scenes.WizardSessionData>;
  wizard: Scenes.WizardContextWizard<ExtendedContext>;
}
@Injectable()
export class TelegramService {
  bot: Telegraf;
  options: ItelegramOptions;

  constructor(
    @Inject(TELEGRAM_MODULE_OPTIONS) options: ItelegramOptions,
    private readonly iherbService: IherbService,
  ) {
    const stepHandleUri = new Composer<ExtendedContext>();

    stepHandleUri.hears(/.{0,}iherb\.com.{0,}/i, async (ctx) => {
      if (ctx.session.isLoading) {
        return;
      }
      console.log('Cursor: ', ctx.wizard.cursor);

      const uri = ctx.update.message.text;
      ctx.reply(MESSAGES.LOADING_IHERB);
      ctx.session.isLoading = true;
      const iHerbProductData = await iherbService.parseUri(uri);
      ctx.session.isLoading = false;
      if (!iHerbProductData) {
        ctx.reply(MESSAGES.WRONG_LINK);
        ctx.reply(MESSAGES.ON_WAITING_ORDER);
      }

      if (Array.isArray(iHerbProductData)) {
        ctx.session.cart = [...iHerbProductData];
        let totalPrice = 0;
        const table = iHerbProductData.reduce((acc, product) => {
          totalPrice += product.qty * product.regularPrice;
          return (
            acc +
            `${product.name} - *${product.qty} шт. по ${
              product.regularPrice / 100
            } Br*\n---\n`
          );
        }, 'Your order: \n\n');
        await ctx.replyWithMarkdown(
          table + `*Total price: ${totalPrice / 100} Br*\n*Всё ок?*`,
          Markup.keyboard([['Ok!', 'Cancel']])
            .oneTime()
            .resize(),
        );
      }
    });

    stepHandleUri.action('Cancel', async (ctx) => {
      ctx.reply('Cancel\n' + MESSAGES.ON_WAITING_ORDER);
      ctx.wizard.back();
    });
    stepHandleUri.hears('Ok!', async (ctx) => {
      ctx.wizard.next();
      ctx.reply(
        'Delivery type:',
        Markup.keyboard([['Taking away', 'Evropost']])
          .oneTime()
          .resize(),
      );
    });

    stepHandleUri.use((ctx) => {
      if (ctx.session.isLoading === true) {
        return;
      }
      ctx.replyWithMarkdown(MESSAGES.ON_WAITING_ORDER);
    });

    const stepHandleShipment = new Composer<ExtendedContext>();

    stepHandleShipment.hears('Taking away', async (ctx) => {
      ctx.session.shipment = 'Taking away';
      await ctx.reply(
        'Taking away.\nConfirm?',
        Markup.keyboard([['Confirm', 'Cancel']])
          .oneTime()
          .resize(),
      );
      // ctx.wizard.next();
    });

    stepHandleShipment.hears('Евроопт', async (ctx) => {
      ctx.session.shipment = 'evroopt';
      await ctx.reply('Evropost address');
      // ctx.wizard.next();
    });

    stepHandleShipment.hears('Confirm', async (ctx) => {
      await ctx.reply('Thanks for the order');
      ctx.wizard.selectStep(0);
    });

    stepHandleShipment.on('message', async (ctx) => {
      if (ctx.session.shipment === 'evroopt') {
        await ctx.reply('Thanks for the order');
      }
      ctx.wizard.selectStep(0);
    });

    const iherbWizard = new Scenes.WizardScene(
      'iherbWizard',
      stepHandleUri,
      stepHandleShipment,
    );

    const bot = new Telegraf<Scenes.WizardContext>(options.token);
    const stage = new Scenes.Stage<Scenes.WizardContext>([iherbWizard], {
      default: 'iherbWizard',
    });
    bot.use(session());
    bot.use(stage.middleware());

    // bot.launch();
  }

  async sendMessage(chatId, message) {
    this.bot.telegram.sendMessage(chatId, message);
  }
}
