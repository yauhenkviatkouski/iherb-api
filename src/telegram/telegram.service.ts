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
  shipment: string;
}

interface ExtendedContext extends Context {
  isLoading: boolean; // TODO
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
      const iHerbProductData = await iherbService.getProductsInfo(uri);
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
        }, 'Ваш заказ: \n\n');
        await ctx.replyWithMarkdown(
          table + `*Общая стоимость: ${totalPrice / 100} Br*\n*Всё ок?*`,
          Markup.keyboard([['Все ок!', 'Отмена']])
            .oneTime()
            .resize(),
        );
      }
    });

    stepHandleUri.action('Отмена', async (ctx) => {
      ctx.reply('Отмена\n' + MESSAGES.ON_WAITING_ORDER);
      ctx.wizard.back();
    });
    stepHandleUri.hears('Все ок!', async (ctx) => {
      ctx.wizard.next();
      ctx.reply(
        'Отлично! Теперь выберите тип доставки:',
        Markup.keyboard([['Самовывоз', 'Евроопт']])
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

    stepHandleShipment.hears('Самовывоз', async (ctx) => {
      ctx.session.shipment = 'Самовывоз';
      await ctx.reply(
        'Самовывоз.\nПодтвердить заказ?',
        Markup.keyboard([['Подтвердить', 'Отмена']])
          .oneTime()
          .resize(),
      );
      // ctx.wizard.next();
    });

    stepHandleShipment.hears('Евроопт', async (ctx) => {
      ctx.session.shipment = 'evroopt';
      await ctx.reply('Евроопт.\nВведите адрес пункта выдачи...');
      // ctx.wizard.next();
    });

    stepHandleShipment.hears('Подтвердить', async (ctx) => {
      await ctx.reply(
        'Теперь данные о товарах и клиенте полетели в google sheets (на самом деле еще не полетели)',
      );
      ctx.wizard.selectStep(0);
    });

    stepHandleShipment.on('message', async (ctx) => {
      if (ctx.session.shipment === 'evroopt') {
        await ctx.reply(
          'Теперь данные о товарах и клиенте полетели в google sheets (на самом деле еще не полетели)',
        );
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
    bot.launch();
  }

  async sendMessage(chatId, message) {
    this.bot.telegram.sendMessage(chatId, message);
  }
}
