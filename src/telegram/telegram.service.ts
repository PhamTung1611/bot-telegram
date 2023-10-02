import { Inject, Injectable } from '@nestjs/common';
import { Markup, Telegraf } from 'telegraf';
import { UsersService } from 'src/users/users.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { TransactionService } from 'src/transaction/transaction.service';
import { BackupService } from 'src/backup/backup.service';

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
      Markup.button.callback('Withdraw', 'withdraw'),
      Markup.button.callback('History', 'history'),
    ], [
      Markup.button.callback('TransferUsername', 'transfer'),
      Markup.button.callback('TransferId', 'transferId'),
    ], [
      Markup.button.callback('Information', 'information'),
    ]
  ]);


  constructor(
    private userService: UsersService,
    private transactionService: TransactionService,
    private backupService: BackupService,

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
      username: ctx.update.message.from.first_name,
    };
    const checkIdUser = await this.userService.findOneUser(options.id);
    if (checkIdUser == 'fail') {
      const jsonData = {
        id_user: ctx.chat.id,
        user_name: ctx.chat.first_name,
      }
      await this.userService.createUser(jsonData);
    }

    const userNameBackUp = await this.backupService.checkUser(options.username);
    if (userNameBackUp == 'true') {
      const moneyBackup = await this.backupService.getMoneyBackUp(options.username);
      await this.userService.updateMoney(options.id, Number(moneyBackup));
      const deleteBackup = await this.backupService.deleteByUserTelegram(options.username);
      console.log(deleteBackup);

      await ctx.reply(`Xin chào ${options.username}, tôi có thể giúp gì cho bạn!`, this.keyboardMarkup);
    } else {
      await ctx.reply(`Xin chào ${options.username}, tôi có thể giúp gì cho bạn!`, this.keyboardMarkup);

    }
  }

  async handleMessage(msg: any) {

    const options = {
      id_user: msg.update.message.from.id,
      user_name: msg.update.message.from.first_name,
      text: msg.update.message.text,
    }

    const data: DataCache = (await this.cacheManager.get(options.id_user)) as DataCache;

    if (!data) {
      return await msg.reply(
        'Vui lòng thử lại', this.keyboardMarkup,
      );
    }

    const listHistory = await this.transactionService.getListHistory(options.id_user)

    switch (data.action) {
      case "recharge":
        if (data.step === 1) {
          const Money = options.text;
          if (!Number(Money)) {
            await this.cacheManager.del(options.id_user);
            return await msg.reply('Vui lòng thực hiện lại', this.keyboardMarkup);
          }
          if (Number(Money) && Number(Money) > 0) {
            data.money = options.text;
            data.step = 2;
            await this.cacheManager.set(options.id_user, data, 15000);
          }
          if (data.step === 2) {
            await this.cacheManager.set(options.id_user, data, 15000);
            await this.userService.updateMoney(options.id_user, Number(data.money));

            const createTransaction = {
              price: String(data.money),
              type: String(data.action),
              sourceAccount: options.id_user,
              destinationAccount: options.id_user
            }

            await this.transactionService.createTransaction(createTransaction);
            await this.cacheManager.del(options.id_user);
            await msg.reply(
              `Nạp tiền thành công`);
            await msg.reply('Tôi có thể giúp gì tiếp cho bạn', this.keyboardMarkup);
          }
        }
      case "withdraw":
        if (data.step === 1) {
          const withdrawMoney = options.text;
          // console.log(withdrawMoney);
          
          if (!Number(withdrawMoney)) {
            return await msg.reply('Vui lòng thực hiện lại', this.keyboardMarkup);
          } else {
            if (Number(withdrawMoney) && Number(withdrawMoney) > 0) {
              data.money = options.text;
              data.step = 2;
              
              await this.cacheManager.set(options.id_user, data, 15000);
            }
            if (data.step === 2) {
              await this.cacheManager.set(options.id_user, data, 15000);
              const withdrawSuccess = await this.userService.withDrawMoney(options.id_user, Number(data.money));
              if (withdrawSuccess == 'False') {
                await this.cacheManager.del(options.id_user);
                return await msg.reply('Số dư tài khoản của bạn không đủ để rút hoặc khi rút tối thiểu ví của bạn phải còn 1 Đồng. Vui lòng thực hiện lại', this.keyboardMarkup);
              } else if (withdrawSuccess == 'true') {
                const createTransaction = {
                  price: String(data.money),
                  type: 'withdraw',
                  sourceAccount: options.id_user,
                  destinationAccount: options.id_user
                }
    
                await this.transactionService.createTransaction(createTransaction);
                const checkMoney = await this.userService.CheckMoney(Number(options.id_user));
                await msg.reply('Rút tiền thành công tài khoản của bạn hiện còn ' + checkMoney + 'Đồng');
                await this.cacheManager.del(options.id_user);
                await msg.reply('Tôi có thể giúp gì tiếp cho bạn', this.keyboardMarkup);
              }
            }
          }

        }
        break;
      case "transfer":
        if (data.step === 1) {
          data.receiver = options.text;
          const checkUsername = await this.userService.checkUserName(data.receiver);
          if (checkUsername) {
            //   await this.cacheManager.del(options.id_user);
            //   return await msg.reply('Xin lỗi hiện tại tôi không tìm thấy người đó', this.keyboardMarkup);
            // } else {
            data.step = 2;
            await this.cacheManager.set(options.id_user, data, 15000);
            await msg.reply('Bạn muốn chuyển bao nhiêu:', Markup.forceReply());
          }
        } else if (data.step === 2) {
          data.money = options.text;
          if (!Number(data.money)) {
            return await msg.reply('Vui lòng thực hiện lại', this.keyboardMarkup);
          }
          if (Number(data.money) && Number(data.money) > 0) {
            const checkWallet = await this.userService.CheckMoney(Number(options.id_user));
            if (Number(data.money) > Number(checkWallet)) {
              await this.cacheManager.del(options.id_user);
              return await msg.reply('Số tiền trong ví của bạn không đủ để bạn thực hiện. Vui lòng thực hiện lại!', this.keyboardMarkup);
            } else {
              const withdrawSuccess = await this.userService.withDrawMoney(options.id_user, Number(data.money));//tru tien
              if (withdrawSuccess == 'False') {
                await this.cacheManager.del(options.id_user);
                return await msg.reply('Số dư tài khoản của bạn tối thiểu phải còn 1 Đồng. Vui lòng thực hiện lại', this.keyboardMarkup);
              } else if (withdrawSuccess == 'true') {
                const idDestination = await this.userService.checkID(data.receiver);
                if (Number(idDestination)) {
                  await this.userService.updateWalletUsername(data.receiver, Number(data.money));
                  const jsonTranfer = {
                    price: data.money,
                    type: 'tranfer',
                    sourceAccount: options.id_user,
                    destinationAccount: idDestination
                  }
                  await this.transactionService.createTransaction(jsonTranfer);
                  await msg.reply(`Chuyển tiền cho ${data.receiver} thành công`);
                  await this.cacheManager.del(options.id_user);
                } else if (idDestination == 'false') {
                  const checkUserBackUp = await this.backupService.checkUser(data.receiver);
                  if (checkUserBackUp == 'true') {
                    await this.backupService.updateMoneyBackup(data.receiver, data.money);
                    await msg.reply(`Chuyển tiền cho ${data.receiver} thành công`);
                    await this.cacheManager.del(options.id_user);
                  } else if (checkUserBackUp == 'false') {
                    const jsonTranfer = {
                      backupMoney: data.money,
                      sourceAccount: options.id_user,
                      userTelegram: data.receiver
                    }
                    await this.backupService.createBackup(jsonTranfer);
                    await msg.reply(`Chuyển tiền cho ${data.receiver} thành công`);
                    await this.cacheManager.del(options.id_user);
                  }
                }
              }
            }
          } else {
            await this.cacheManager.del(options.id_user);
            return await msg.reply('Bạn nhập sai. Vui lòng thực hiện lại', this.keyboardMarkup);
          }
          await msg.reply('Tôi có thể giúp gì tiếp cho bạn', this.keyboardMarkup);
        }
        break;
      case 'history':
        if (data.step === 1) {
          const amountHistory = options.text;
          if (!Number(amountHistory)) {
            await this.cacheManager.del(options.id_user);
            return await msg.reply('Vui lòng thực hiện lại', this.keyboardMarkup);
          } else {
            // console.log(typeof (listHistory), 'ahihi');
            if (listHistory < amountHistory) {
              await this.cacheManager.del(options.id_user);
              return await msg.reply(`Xin lỗi bạn chỉ có ${listHistory} giao dịch thôi`, this.keyboardMarkup);
            } else {
              const selectHistory = await this.transactionService.getAmountHistory(amountHistory,options.id_user);
              for (const item of selectHistory) {
                await msg.reply(`Mã giao dịch:\n ${item?.id}\nSố tiền: ${item?.price}\nKiểu: ${item?.type}\nTài khoản nguồn: ${item.sourceAccount}\nTài khoản nhận: ${item.destinationAccount}`);
              }
              await this.cacheManager.del(options.id_user);
              await msg.reply('Tôi có thể giúp gì tiếp cho bạn', this.keyboardMarkup);
            }
          }
        }
        break;
      case 'transferId':
        if (data.step === 1) {
          data.receiver = options.text;
          const checkUserID = await this.userService.checkIdUser(data.receiver);
          // console.log(checkUserID);

          if (checkUserID == 'false') {
            await this.cacheManager.del(options.id_user);
            return await msg.reply('Xin lỗi hiện tại tôi không tìm thấy người đó', this.keyboardMarkup);
          } else {
            data.step = 2;
            await this.cacheManager.set(options.id_user, data, 15000);
            await msg.reply('Bạn muốn chuyển bao nhiêu:', Markup.forceReply());
          }
        } else if (data.step === 2) {
          data.money = options.text;
          if (!Number(data.money)) {
            return await msg.reply('Vui lòng thực hiện lại', this.keyboardMarkup);
          }
          if (Number(data.money) && Number(data.money) > 0) {
            const checkWallet = await this.userService.CheckMoney(Number(options.id_user));
            if (Number(data.money) > Number(checkWallet)) {
              await this.cacheManager.del(options.id_user);
              return await msg.reply('Số tiền trong ví của bạn không đủ để bạn thực hiện. Vui lòng thực hiện lại!', this.keyboardMarkup);
            } else {
              const withdrawSuccess = await this.userService.withDrawMoney(options.id_user, Number(data.money));//tru tien
              if (withdrawSuccess == 'False') {
                await this.cacheManager.del(options.id_user);
                return await msg.reply('Số dư tài khoản của bạn tối thiểu phải còn 1 Đồng. Vui lòng thực hiện lại', this.keyboardMarkup);
              } else if (withdrawSuccess == 'true') {
                await this.userService.updateWalletUsername(data.receiver, Number(data.money));
                const jsonTranfer = {
                  price: data.money,
                  type: 'tranfer',
                  sourceAccount: options.id_user,
                  destinationAccount: data.receiver
                }
                await this.transactionService.createTransaction(jsonTranfer);
                await this.userService.updateWalletUserID(data.receiver,Number(data.money));
                const name = await this.userService.checkName(data.receiver);
                await msg.reply(`Chuyển tiền cho ${name} thành công`);
                await this.cacheManager.del(options.id_user);
              }
            }
          } else {
            await this.cacheManager.del(options.id_user);
            return await msg.reply('Bạn nhập sai. Vui lòng thực hiện lại', this.keyboardMarkup);
          }
          await msg.reply('Tôi có thể giúp gì tiếp cho bạn', this.keyboardMarkup);
        }
        break;
      default:
        await this.cacheManager.del(options.id_user);
        await msg.reply('Xin lỗi tôi không hiểu!', this.keyboardMarkup);
        break;
    }
  }

  async handleButton(msg: any) {
    const options = {
      id_user: msg.update.callback_query.from.id,
      user_name: msg.update.callback_query.from.first_name,
      data: msg.update.callback_query.data
    }

    const data: DataCache = ((await this.cacheManager.get(options.id_user)) as DataCache) || {
      action: '',
      step: 1,
      money: '',
    };

    const checkIdUser = await this.userService.findOneUser(options.id_user);

    const listHistory = await this.transactionService.getListHistory(options.id_user)
    // console.log(listHistory);
    
    switch (options.data) {
      case 'recharge':
        if (checkIdUser == 'fail') {
          return await msg.reply(`Vui lòng gõ '/start' để bắt đầu`);
        }
        if (data.action === '') {
          await this.cacheManager.set(options.id_user, {
            action: 'recharge',
            step: 1,
          }, 15000);
          await msg.replyWithHTML(
            'Bạn muốn nạp bao nhiêu tiền'
          );
        } else {
          await this.cacheManager.del(options.id_user);
        }
        break;
      case 'checkMoney':
        if (checkIdUser == 'fail') {
          return await msg.replyWithHTML(`Vui lòng gõ '/start' để bắt đầu`);
        }
        const checkMoney = await this.userService.CheckMoney(Number(options.id_user));
        await msg.replyWithHTML('Số tiền trong ví của bạn đang là ' + checkMoney + ' Đồng');
        await msg.replyWithHTML('Tôi có thể giúp gì tiếp cho bạn', this.keyboardMarkup);
        await this.cacheManager.del(options.id_user);
        break;
      case 'withdraw':
        if (!checkIdUser) {
          return await msg.replyWithHTML(`Vui lòng gõ '/start' để bắt đầu`);
        }
        if (data.action === '') {
          await this.cacheManager.set(options.id_user, {
            action: 'withdraw',
            step: 1
          }, 15000);
          await msg.reply('Bạn muốn rút bao nhiêu tiền');
        } else {
          await this.cacheManager.del(options.id_user);
        }
        break;
      case 'transfer':
        if (checkIdUser == 'fail') {
          return await msg.replyWithHTML(`Vui lòng gõ '/start' để bắt đầu`);
        }
        if (data.action === '') {
          await this.cacheManager.set(options.id_user, {
            action: 'transfer',
            step: 1
          }, 15000);
          await msg.replyWithHTML('Vui lòng nhập đúng username người bạn muốn chuyển', Markup.forceReply());
        }
        else {
          await this.cacheManager.del(options.id_user);
        }
        break;
      case 'history':
        if (checkIdUser == 'fail') {
          return await msg.reply(`Vui lòng gõ '/start' để bắt đầu`);
        }
        if (listHistory === 0) {
          await msg.reply('Bạn không có lịch sử giao dịch nào')
          return await msg.reply('Tôi có thể giúp gì tiếp cho bạn', this.keyboardMarkup);
        }
        if (data.action === '') {
          await this.cacheManager.set(options.id_user, {
            action: 'history',
            step: 1,
          }, 15000);

          await msg.reply(`Bạn đang có ${listHistory} giao dịch bạn muốn xem bao nhiêu giao dịch?`);
          // console.log(options.id_user);
          
        } else {
          await this.cacheManager.del(options.id_user);
        }
        break;
      case 'transferId':
        if (checkIdUser == 'fail') {
          return await msg.reply(`Vui lòng gõ '/start' để bắt đầu`);
        }
        if (data.action === '') {
          await this.cacheManager.set(options.id_user, {
            action: 'transferId',
            step: 1
          }, 15000);
          await msg.reply('Vui lòng nhập đúng ID người bạn muốn chuyển', Markup.forceReply());
        }
        else {
        await this.cacheManager.del(options.id_user);
        }
        break;
      case 'information':
        if (checkIdUser == 'fail') {
          return await msg.reply(`Vui lòng gõ '/start' để bắt đầu`);
        }
        const info = await this.userService.checkInfo(options.id_user);
       await msg.reply(` ID:${info.id_user} \n Username:${info.user_name} \n Money:${info.blance}`)
        await msg.reply('Tôi có thể giúp gì tiếp cho bạn', this.keyboardMarkup);
        await this.cacheManager.del(options.id_user);
        break;
      default:
        await this.cacheManager.del(options.id_user);
        await msg.reply(`Xin lỗi tôi không hiểu`);
        await msg.reply('Tôi chỉ giúp bạn như bên dưới thôi!', this.keyboardMarkup);
        break;
    }
  }
}
