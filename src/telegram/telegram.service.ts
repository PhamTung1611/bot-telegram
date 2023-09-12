import { Inject, Injectable } from '@nestjs/common';
import { Markup, Telegraf } from 'telegraf';
import { UsersService } from 'src/users/users.service';
import { TransactionService } from 'src/transation/transation.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

interface DataCache {
  action: string;
  step: number;
  money: string;
  receiver?: string;
}

@Injectable()
export class TelegramBotService {
  private bot: Telegraf;
  private keyboardMarkup = Markup.inlineKeyboard([
    [
      Markup.button.callback('Recharge', 'recharge'),
      Markup.button.callback('CheckMoney', 'checkMoney'),
    ],
    [
      Markup.button.callback('Transfer', 'transfer'),
      Markup.button.callback('History', 'history'),
    ]
  ]);


  constructor(
    private userService: UsersService,
    private transactionService: TransactionService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {
    this.bot = new Telegraf('6300451285:AAFo4sSfGG8lHsgexYWmwvS6W9_PJ1VmLI4');
    // this.bot.use(Telegraf.log());
    this.bot.start(this.handleStart.bind(this));
    this.bot.on('text', this.handleMessage.bind(this));
    this.bot.action(/.*/, this.handleButton.bind(this));
    this.bot.launch();
  }

  async handleStart(ctx: any) {
    const options = {
      id: ctx.update.message.from.id,
      username: ctx.update.message.from.username,
    };
    const checkIdUser = await this.userService.findOneUser(options.id);
    if (checkIdUser == 'fail') {
      const jsonData = {
        id_user: ctx.chat.id,
        user_name: ctx.chat.username,
      }
      await this.userService.createUser(jsonData);
    }


    ctx.reply(`Xin chào ${ctx.chat.username}, tôi có thể giúp gì cho bạn!`, this.keyboardMarkup);
  }

  async handleMessage(msg: any) {

    const options = {
      id_user: msg.update.message.from.id,
      user_name: msg.update.message.from.username,
      text: msg.update.message.text,
    }

    const data: DataCache = (await this.cacheManager.get(options.id_user)) as DataCache;

    if (!data) {
      return await msg.reply(
        'Vui lòng thử lại', this.keyboardMarkup,
      );
    }

    switch (data.action) {
      case "recharge":
        if (data.step === 1) {
          const Money = options.text;
          if (Number(Money) && Number(Money) > 0) {
            data.money = options.text;
            data.step = 2;
            await this.cacheManager.set(options.id_user, data, 30000);
          }
          if (data.step === 2) {
            await this.cacheManager.set(options.id_user, data, 30000);
            await this.userService.updateMoney(options.id_user, Number(data.money));
            console.log('aaaaa');

            const createTransaction = {
              price: String('+' + data.money),
              type: 'Nạp Tiền',
              // sourceAccount: options.id_user,
              // destinationAccount: options.id_user
            }

            await this.transactionService.createRecharge(createTransaction);
            console.log(11);
            await msg.reply(
              `Nạp tiền thành công`);
            await msg.reply('Tôi có thể giúp gì tiếp cho bạn', this.keyboardMarkup);
            await this.cacheManager.del(options.id_user);
          }

        }

      // case "/Transfer":
      //   msg.reply('Bạn đã chọn Chuyển tiền');
      //   break;
      // case "CheckMoney":
      //   const checkMoney = await this.userService.CheckMoney(Number(options.id_user));
      //   msg.reply('Số tiền trong ví của bạn đang là '+checkMoney+' Đồng');
      //   break;
      default:
        break;
    }


  }

  async handleButton(msg: any) {
    const options = {
      id_user: msg.update.callback_query.from.id,
      user_name: msg.update.callback_query.from.username,
      data: msg.update.callback_query.data
    }
    // console.log(options);

    const data: DataCache = ((await this.cacheManager.get(options.id_user)) as DataCache) || {
      action: '',
      step: 1,
      money: '',
    };


    switch (options.data) {
      case 'recharge':
        // console.log(123);
        if (data.action === '') {
          await this.cacheManager.set(options.id_user, {
            action: 'recharge',
            step: 1,
          });
          await msg.reply(
            'Bạn muốn nạp bao nhiêu tiền',
            Markup.forceReply(),
          );
        }
        break;
      case 'checkMoney':
        const checkMoney = await this.userService.CheckMoney(Number(options.id_user));
        msg.reply('Số tiền trong ví của bạn đang là ' + checkMoney + ' Đồng');
        break;
      default:
        break;
    }
  }
}

