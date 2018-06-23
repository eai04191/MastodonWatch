"use strict";


function getOption() {
  const instance = "mstdn.jp";
  const token = decodeURIComponent(location.search.match(/token=(.*?)(&|$)/)[1]);

  const searchRegExp = /crypko|くりぷ(こ|子)|クリプ(コ|子)/gi;

  // すべてのtootを流す
  const testModeFlag = false;
  return {
    instance: instance,
    token: token,
    searchRegExp: searchRegExp,
    testModeFlag: testModeFlag
  };
}

function update(text) {
  let div = document.getElementById("articles-container");
  let content = `<p>${text}</p>`;
  div.innerHTML = "<article>" + content + "</article>" + div.innerHTML;
}

function connect(instance, token, searchRegExp, testModeFlag) {
  let ws = new WebSocket(`https://${instance}/api/v1/streaming?access_token=${token}&stream=public`);

  ws.onopen = function () {
    update("Connected.");
  };

  ws.onerror = function (error) {
    update("Connection Error");
    // TODO: エラーメッセージを画面に出したい
    console.log(error);
  };

  ws.onmessage = function (e) {
    // console.log(JSON.parse(JSON.parse(e.data)['payload']));
    let data = JSON.parse(e.data);
    if (data["event"] == "update") {
      let toot = JSON.parse(data["payload"]);
      let text = toot["content"];
      let hit = false;
      if (searchRegExp.test(text)) {
        hit = true;
      }

      if (hit || testModeFlag) {
        console.log(toot);
        let account_name = toot["account"]["display_name"];
        let account_icon = toot["account"]["avatar"];
        let account_url = toot["account"]["url"];
        let account_instance = toot["account"]["url"].match(/https:\/\/(.*?)\//)[1];
        let account_username = toot["account"]["username"];
        let created_at = toot["created_at"];
        let content = toot["content"];
        let url = toot["url"];
        let id = toot["id"];
        let div = document.getElementById("articles-container");

        let icon_html = `<a href="${account_url}" target="_blank" ><img src="${account_icon}" class="icon"></a>`;
        let name_html =
          `<a href="${account_url}" target="_blank" class="name">${account_name}<span class="username">${account_username}@${account_instance}</span></a>`;
        let time_html = `<a href="https://mstdn.io/web/statuses/${id}" class="time" target="_blank">` + moment(
          created_at).format("h:mm") + "</a>";
        let content_html = `<div class="text">${content}</div>`;
        div.innerHTML =
          "<article>" +
          "<header>" +
          icon_html +
          name_html +
          time_html +
          "</header>" +
          content_html +
          "</article>" +
          div.innerHTML;
      }
    }
  };
}

let option = getOption();
connect(option.instance, option.token, option.searchRegExp, option.testModeFlag);