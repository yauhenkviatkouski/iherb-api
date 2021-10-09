import { Inject, Injectable } from '@nestjs/common';
import { IherbProductInfo, IherbService } from 'src/iherb/iherb.service';
import { Telegraf, Scenes, Markup, Composer, session, Context } from 'telegraf';
import { MESSAGES, TELEGRAM_MODULE_OPTIONS } from './telegram.constants';
import { ItelegramOptions } from './telegram.interface';

// TODO: не все продукты доступны - попробуйте через директ, убедитесь что все доступно
// TODO:

interface ExtendedSession extends Scenes.WizardSession {
  // will be available under `ctx.session.mySessionProp`
  isLoading: boolean;
  cart: IherbProductInfo[];
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
    // const stepAskUri = new Composer<Scenes.WizardContext>();
    // stepAskUri.use(async (ctx) => {
    //   await ctx.reply('Send link to iherb cart or product...');
    //   return ctx.wizard.next();
    // });

    const stepHandleUri = new Composer<ExtendedContext>();

    stepHandleUri.hears(/.{0,}iherb\.com.{0,}/i, async (ctx) => {
      const uri = ctx.update.message.text;
      ctx.reply(MESSAGES.LOADING_IHERB);
      ctx.session.isLoading = true;
      const iHerbProductData = await iherbService.getProductsInfo(uri);
      ctx.session.isLoading = false;
      if (!iHerbProductData) {
        ctx.reply(MESSAGES.WRONG_LINK);
        ctx.reply(MESSAGES.ON_WAITING_ORDER);
      }

      if (Array.isArray(iHerbProductData)) {
        let totalPrice = 0;
        const table = iHerbProductData.reduce((acc, product) => {
          totalPrice += product.qty * product.regularPrice;
          return (
            acc +
            `${product.name} - *${product.qty} шт. по ${
              product.regularPrice / 100
            } Br*\n---\n`
          );
        }, 'Ваш заказ: \n');
        ctx.replyWithMarkdown(table + `*Общая стоимость: ${totalPrice / 100} Br*`, {
          parse_mode: 'Markdown',
        });
      }

      // await ctx.reply(JSON.stringify(iHerbProductData));
    });

    stepHandleUri.use((ctx) => {
      if (ctx.session.isLoading === true) {
        return;
      }
      ctx.replyWithMarkdown(MESSAGES.ON_WAITING_ORDER);
    });

    const iherbWizard = new Scenes.WizardScene(
      'iherbWizard',
      // stepAskUri,
      stepHandleUri,
      // async (ctx) => {
      //   await ctx.reply('Step 3');
      //   return ctx.wizard.next();
      // },
      // async (ctx) => {
      //   await ctx.reply('Step 4');
      //   return ctx.wizard.next();
      // },
      // async (ctx) => {
      //   await ctx.reply('Done');
      //   return await ctx.scene.leave();
      // },
    );

    const bot = new Telegraf<Scenes.WizardContext>(options.token);
    const stage = new Scenes.Stage<Scenes.WizardContext>([iherbWizard], {
      default: 'iherbWizard',
    });
    bot.use(session());
    bot.use(stage.middleware());
    bot.launch();

    // Enable graceful stop
    // process.once('SIGINT', () => bot.stop('SIGINT'));
    // process.once('SIGTERM', () => bot.stop('SIGTERM'));
  }

  async sendMessage(chatId, message) {
    this.bot.telegram.sendMessage(chatId, message);
  }
}
