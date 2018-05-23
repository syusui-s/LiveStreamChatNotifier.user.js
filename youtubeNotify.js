class Message {
  constructor(title, img, message) {
    Object.assign(this, { title, img, message });
  }
}


const audio = new Audio('data:audio/wav;base64,//N0ZAAKARdKr6CUAAmIAdwBQBAAApAAoEAGMYxjG+QAZjAAEAAAAc5znP+pznQOAGAYBgGAYHD5zkIQhCN///OQhP/7f////+hA4AYHD5ygIAmD4Pg+93y7+D4P1HP//+IAQBD///////////wxBAEAQcJAQ4Pn/Z6wfBwMZQHwfB8H/ggCETg4CCq7S6XUa7JuDW63JKSyQg08gJ2CqqhXwEURD4m7//N0ZBwO1gV5L8GoAQlwAhgBgBAA6m0dVKs4zSUCkR4rgNvmCaJ7Gmmocd+VITkmmqVFtrpMGyIp5AF+cqEp6o30XbSYTmIxzMb6Rv/8fN/5o0J/3qZ/9e236vuK7WRlbP/YoNy3/9PeQiZ/+n0xl//////////33e1X36W/VUElB0R2vZSsHRWPG/2CIqKCH97BwYMV1uultBbkBYnq+qzNJg2KzVVh//N0ZBINWVtpL+SgAQlYAgwBwBAAix3WksLwUbYNKJSzmZIq5//goAYF4CgPgBwbgsEQsWETSEiEm0dHZaZmv+v4/9pjuZS5mL7+bji/////////hmooWGmDxx5DGO9wiJcJlvuhKf6WzX//1EP///////////V/lNbUrdHuJNUlsJB+9jRwJjhhYRjRYAMHHzi0Krt9upiIYUfYFC+IcBr3uuB8oQXp//N0ZBQM9Itljz0PWgibqggAAAUcbiObpfjlllu9b2+trDXr3X06Q6fDEitg6GgEICVA5gCQkoGcAeAQAMgcidfhw34cuLseg4YBUQgQeBAwsGAGEg0DT1fV/VMBMBPJB0JGTJkan/9v/p6J07X3eeqlnJfvaykctLO63PaUy3MrodVu9qnIioUgxKmZh4mIgTfbDYmFgNoEcJlyz1nNyY/3X+lklXbK//N0ZB0OvMWLjySvhwgzVggAAEXp0s2E9XV1U+dG/+rCQtM4iAKgFyKElBcCdkoM0+yCKklZcy8MaHqOdSE4Lg2mg9VbBFniea17v3puEgIBgTlCBo0FToKki3///DrWBUBBIPGTIDCJEBgwTDH//n//y3nLkWt+cjgBPMNzw47Y+1U3kMDqr+AYpoevhsW63f+22hxCAPnJbNTLYYuYSlVctH0UUORr//N0ZBkMPONxLxgsewlwAggAAAS8TQRHhiEyE0Q7phGQ4Akhxf5xMxCBsDYEgJAeNhxA6nA6JxGEUeiGBQBYdg4KScHghriZCeVXv4A3hggQB9584fGyP/9UreueK///////////9P/vSy54tLiIXLtUTqYXDzkgol02FR4xJNhYDCNCvtvvrNAGhCRFj8HAXTIOceI5iXCULUAy5IvR28CkBDcBjNgN//N0ZCQN4VtfKgwsfgdi2ggAAAUdgNqZGRkZaKv//Jhii/mZna1rzTNF3raLoXFqZtwZB6IwiiMIw6i4WA3CQTx+CgUE0Kx4Ighm44FgqCIyS1/sLFj8ggCAIAmD/5fo/+Z6V+26oycy7uigyfqxyoD83XkjbtHXM6bt3qwK/921tskgAEYFICqC0BKE4DY/CmFdyUmFkjEYZsYOHFCqmT2dldlPUxJq//N0ZCoKfdN3LygG54ngAggAAAS82m/m526WnU0po/11//1rKo3DtInSSLQJGmLRBRRZhMYHGjhw1IMmgnAf////////////e9JdS2yjG7hQy2CylirEqNWGho8FTgZU08NJFWpC9WnE0nHzDLoXLBWQJ4HSo13RzYrlumW2OZdwz2SoaHYHmQXQGS9/akeay8PyJmYTQ2eDqwMVDRZ0q6/d0fUp4udP//N0ZEEK0KdRKaQMAArYAgQBQBAAESwssMpAVjwCaExlLnVL4r/81UXgT///////////nG3cgqTehxwu+ogaiJ4DCbFAU4YaMLlx0c06GwUsCREShtopt7fXXwSe6yVuSgsAhdpxdh2CuktV5oqUphCdm2wBxgZnqdBFAUAMATExQsLFgeDUXMhf/+ig4mkKXbYWJDoeLHAucUJEcadKrKkjEsfFyxeZ//N0ZFISddlJL8egAAYgAiABgBAAjg8huGFioDokPTfti///af/8mVXWybekmqu1pYoY3///+g0t5/7/+0DkgBaJr//j/////5+bwaEiP////6r7FB9f/////////////16qGIQglsq0SrHf3XGU1RNgPYA3gKMMEdHqSrLRMUaSX////////////////////7+nevNTdlam071mS00+e4VjunOjaOQy//N0ZDgIRc0EAOaIAI9LkfwBwBAB6K7S5LvMVGRgdX///9v////////////2S+t9LcnR5VVTqZEduHRVK5VMzOgpVVCOyrdwTqVzLYQjsdpAp2UeRh1U6nMINR9VETidmZqh88t0sqAlr1aUeV27Pvvc79VcqMlZXyXt6w7hoQyQiDvPeCp46VLVB0svERU6JYaEsRPEQMgqdr//////if//7/T//Vv///N0ZEsHsAD7GAQiXA6DpewACAUxlLNqUpSlK1DG81HKUszobzGVylQxSmAiqFARKOUqhWdSlKVwoCXqV9WDATi1IEjLzKWT+WWSxyMv/NWstlj/2zIylk/llkspf8uZMstllllsqGTWT6yyyWOR//mTLLZZZZbHI1ayX+yyWfyyVDVlls/llCgog5//sGqphqu////////////4sLiqXYqKiop9QsLC//N0ZGYJ9X6SAQQDEoiYAUACAAQC7PmgqKCweAoVFhIaTEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV');

regexps = [/勇気ちひろ/, /森中花咲/, /モイラ/, /樋口楓/, /美兎/, /静 ?凛/, /刀也/] // ← regexps.push()で動的に変更できる
chatItems = document.querySelector('#items.yt-live-chat-item-list-renderer');
m = new MutationObserver(records => {
  records.forEach(record => {
    if (record.type === 'childList')
      record.addedNodes.forEach(chatItem => {
        const name = chatItem.querySelector('#author-name');
        const badge = chatItem.querySelector('yt-live-chat-author-badge-renderer[type=moderator]');

        if (badge) {
          const img = chatItem.querySelector('img#img');
          new Notification((name && name.textContent), {
            icon: img && img.src,
            body: chatItem.querySelector('#message').textContent
          });
          audio.play();
        }
      });
  });
});
m.observe(chatItems, { childList: true });
