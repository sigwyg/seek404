import {
    getHtmlDom,
    getLinkAll,
    filteredLinkAll,
    check404,
} from "./util.ts"

/**
 *
 * 1. URLを受け取って、リンクを抽出する
 * 2. リンクをfetchして、404か確認する
 * 3. サイト内リンクであれば、次のページへ移動→1に戻る
 * 4. サイト内リンクは重複チェックする
 *
 */


const url = "https://gaiheki-madoguchi.com/"
const origin_url = url.match(/https?:\/\/[^/]+\//)[0];

const html = await getHtmlDom(url)
const links = getLinkAll(html)

const links_inside = filteredLinkAll(links, origin_url)
const check_map = await check404(links_inside)
console.log(check_map)
