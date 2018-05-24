// ==UserScript==
// @name               YouTubeCommentNotifier.user.js
// @description        YouTubeのライブチャットのストリームで特定のメッセージを通知してくれるやつ
// @namespace          https://github.com/syusui-s/YouTubeCommentNotifier.user.js
// @version            0.9.24
// @match              https://www.youtube.com/watch*
// @match              https://www.youtube.com/live_chat_replay
// @grant              unsafeWindow
// @run-at             document-end
// ==/UserScript==

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

// count 回まで処理を再試行する。戻り値が falsy の値のとき、次の処理に移る
const autoRetry = async (count, fn, ...args) => {
  for (let i = 0; i < count; ++i) {
    const result = await fn(...args);
    if (result)
      return result;
  }
};

const notifySound = {
  audio: new Audio('data:audio/mp3;base64,//N0ZAAKARdKr6CUAAmIAdwBQBAAApAAoEAGMYxjG+QAZjAAEAAAAc5znP+pznQOAGAYBgGAYHD5zkIQhCN///OQhP/7f////+hA4AYHD5ygIAmD4Pg+93y7+D4P1HP//+IAQBD///////////wxBAEAQcJAQ4Pn/Z6wfBwMZQHwfB8H/ggCETg4CCq7S6XUa7JuDW63JKSyQg08gJ2CqqhXwEURD4m7//N0ZBwO1gV5L8GoAQlwAhgBgBAA6m0dVKs4zSUCkR4rgNvmCaJ7Gmmocd+VITkmmqVFtrpMGyIp5AF+cqEp6o30XbSYTmIxzMb6Rv/8fN/5o0J/3qZ/9e236vuK7WRlbP/YoNy3/9PeQiZ/+n0xl//////////33e1X36W/VUElB0R2vZSsHRWPG/2CIqKCH97BwYMV1uultBbkBYnq+qzNJg2KzVVh//N0ZBINWVtpL+SgAQlYAgwBwBAAix3WksLwUbYNKJSzmZIq5//goAYF4CgPgBwbgsEQsWETSEiEm0dHZaZmv+v4/9pjuZS5mL7+bji/////////hmooWGmDxx5DGO9wiJcJlvuhKf6WzX//1EP///////////V/lNbUrdHuJNUlsJB+9jRwJjhhYRjRYAMHHzi0Krt9upiIYUfYFC+IcBr3uuB8oQXp//N0ZBQM9Itljz0PWgibqggAAAUcbiObpfjlllu9b2+trDXr3X06Q6fDEitg6GgEICVA5gCQkoGcAeAQAMgcidfhw34cuLseg4YBUQgQeBAwsGAGEg0DT1fV/VMBMBPJB0JGTJkan/9v/p6J07X3eeqlnJfvaykctLO63PaUy3MrodVu9qnIioUgxKmZh4mIgTfbDYmFgNoEcJlyz1nNyY/3X+lklXbK//N0ZB0OvMWLjySvhwgzVggAAEXp0s2E9XV1U+dG/+rCQtM4iAKgFyKElBcCdkoM0+yCKklZcy8MaHqOdSE4Lg2mg9VbBFniea17v3puEgIBgTlCBo0FToKki3///DrWBUBBIPGTIDCJEBgwTDH//n//y3nLkWt+cjgBPMNzw47Y+1U3kMDqr+AYpoevhsW63f+22hxCAPnJbNTLYYuYSlVctH0UUORr//N0ZBkMPONxLxgsewlwAggAAAS8TQRHhiEyE0Q7phGQ4Akhxf5xMxCBsDYEgJAeNhxA6nA6JxGEUeiGBQBYdg4KScHghriZCeVXv4A3hggQB9584fGyP/9UreueK///////////9P/vSy54tLiIXLtUTqYXDzkgol02FR4xJNhYDCNCvtvvrNAGhCRFj8HAXTIOceI5iXCULUAy5IvR28CkBDcBjNgN//N0ZCQN4VtfKgwsfgdi2ggAAAUdgNqZGRkZaKv//Jhii/mZna1rzTNF3raLoXFqZtwZB6IwiiMIw6i4WA3CQTx+CgUE0Kx4Ighm44FgqCIyS1/sLFj8ggCAIAmD/5fo/+Z6V+26oycy7uigyfqxyoD83XkjbtHXM6bt3qwK/921tskgAEYFICqC0BKE4DY/CmFdyUmFkjEYZsYOHFCqmT2dldlPUxJq//N0ZCoKfdN3LygG54ngAggAAAS82m/m526WnU0po/11//1rKo3DtInSSLQJGmLRBRRZhMYHGjhw1IMmgnAf////////////e9JdS2yjG7hQy2CylirEqNWGho8FTgZU08NJFWpC9WnE0nHzDLoXLBWQJ4HSo13RzYrlumW2OZdwz2SoaHYHmQXQGS9/akeay8PyJmYTQ2eDqwMVDRZ0q6/d0fUp4udP//N0ZEEK0KdRKaQMAArYAgQBQBAAESwssMpAVjwCaExlLnVL4r/81UXgT///////////nG3cgqTehxwu+ogaiJ4DCbFAU4YaMLlx0c06GwUsCREShtopt7fXXwSe6yVuSgsAhdpxdh2CuktV5oqUphCdm2wBxgZnqdBFAUAMATExQsLFgeDUXMhf/+ig4mkKXbYWJDoeLHAucUJEcadKrKkjEsfFyxeZ//N0ZFISddlJL8egAAYgAiABgBAAjg8huGFioDokPTfti///af/8mVXWybekmqu1pYoY3///+g0t5/7/+0DkgBaJr//j/////5+bwaEiP////6r7FB9f/////////////16qGIQglsq0SrHf3XGU1RNgPYA3gKMMEdHqSrLRMUaSX////////////////////7+nevNTdlam071mS00+e4VjunOjaOQy//N0ZDgIRc0EAOaIAI9LkfwBwBAB6K7S5LvMVGRgdX///9v////////////2S+t9LcnR5VVTqZEduHRVK5VMzOgpVVCOyrdwTqVzLYQjsdpAp2UeRh1U6nMINR9VETidmZqh88t0sqAlr1aUeV27Pvvc79VcqMlZXyXt6w7hoQyQiDvPeCp46VLVB0svERU6JYaEsRPEQMgqdr//////if//7/T//Vv///N0ZEsHsAD7GAQiXA6DpewACAUxlLNqUpSlK1DG81HKUszobzGVylQxSmAiqFARKOUqhWdSlKVwoCXqV9WDATi1IEjLzKWT+WWSxyMv/NWstlj/2zIylk/llkspf8uZMstllllsqGTWT6yyyWOR//mTLLZZZZbHI1ayX+yyWfyyVDVlls/llCgog5//sGqphqu////////////4sLiqXYqKiop9QsLC//N0ZGYJ9X6SAQQDEoiYAUACAAQC7PmgqKCweAoVFhIaTEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV'),

  play() {
    this.audio.play();
  },
};

/**
 * ライブストリームに流れるメッセージ
 */
class Message {
  constructor(author, iconUrl, badgeType, body) {
    Object.assign(this, { author, iconUrl, badgeType, body, });
  }

  matchName(regex) {
    return regex.test(this.author);
  }

  /**
   * モデレータならばtrueを返す
   *
   * モデレータについてはこちら: https://support.google.com/youtube/answer/7023301?hl=ja
   *
   * 「にじさんじ」の放送では、他の配信者がモデレータになっていることが多い。
   */
  isModerator() {
    return this.badgeType === 'moderator';
  }
}

/**
 * 通知メッセージを仲介してくれるやつ
 */
class NotificatonMessage {
  static fromMessage(message) {
    return new this(
      message.author,
      message.iconUrl,
      message.body,
    );
  }

  constructor(title, iconUrl, body) {
    Object.assign(this, { title, iconUrl, body });
  }

  /**
   * Notification APIを用いて、通知する
   */
  async notify() {
    // TODO  直接依存しない形にする
    return new window.Notification(this.title || '', {
      icon: this.iconUrl,
      body: this.body,
    });
  }
}

/**
 * 通知に関する処理を置いておくところ
 */
class NotificationService {
  /**
   * @param {object}        notifySound        通知音を鳴らしてくれるような仕組みを持つオブジェクト
   * @param {array<RegExp>} authorNamePatterns 通知したいメッセージの著者の名前にマッチするパターンの配列
   */
  constructor(notifySound, authorNamePatterns) {
    Object.assign(this, { notifySound, authorNamePatterns });
  }

  /**
   * 通知します
   *
   * @param {Message} message
   */
  notify(message) {
    if (message.isModerator() || this.authorNamePatterns.some(r => message.matchName(r))) {
      NotificatonMessage
        .fromMessage(message)
        .notify();

      this.notifySound.play();
    }
  }

  async requestPermission() {
    if (Notification.permission !== 'granted') {

      const result = await Notification.requestPermission();

      if (result !== 'granted') {
        window.alert('Notification APIで通知の許可がありません。通知を受け取るには、通知を許可してください。');
        return null;
      }
    }
  }
}

async function main() {
  const regexps = [/勇気ちひろ/, /森中花咲/, /宇志海いちご/, /《にじさんじ所属の女神》モイラ/, /樋口楓/, /月ノ美兎/, /静 ?凛/, /刀也/]; // ← regexps.push()で動的に変更できる
  const notificationService = new NotificationService(notifySound, regexps);

  const toMessage = chatItem => {
    const nameElem  = chatItem.querySelector('#author-name');
    const badgeElem = chatItem.querySelector('yt-live-chat-author-badge-renderer');
    const iconElem  = chatItem.querySelector('yt-img-shadow > img#img');
    const bodyElem  = chatItem.querySelector('#message');

    if (nameElem && iconElem) {
      const name      = nameElem.textContent;
      const iconUrl   = iconElem.src;
      const body      = bodyElem.textContent;
      const badgeType = badgeElem && badgeElem.getAttribute('type'); // nullable

      return new Message(name, iconUrl, badgeType, body);
    }
  };

  const observer = records => {
    records.forEach(record => {
      switch (record.type) {
      case 'childList':
        record.addedNodes.forEach(chatItem => {
          const messageOpt = toMessage(chatItem);
          if (messageOpt)
            notificationService.notify(messageOpt);
        });
        break;
      }
    });
  };
    
  // Notification APIが使えない場合は終了
  if (! window.Notification) {
    window.console.error('Notification がサポートされていません');
    return;
  }

  await notificationService.requestPermission();

  const INTERVAL = 500; // ms
  const RETRY    = 30;  // times

  const chatItemList = autoRetry(RETRY, async () => {
    const chatIframe   = document.querySelector('#chatframe');
    const chatItemList = chatIframe && chatIframe.contentDocument.querySelector('#items.yt-live-chat-item-list-renderer');

    if (! chatItemList)
      await sleep(INTERVAL);

    return chatItemList;
  });

  if (! chatItemList)
    return;

  const m = new MutationObserver(observer);
  m.observe(chatItemList, { childList: true });

}

main();
