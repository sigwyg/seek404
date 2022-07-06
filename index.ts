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
const origin = url.match(/https?:\/\/[^/]+\//)[0];

let links_inside = new Map()
links_inside.set(url, undefined)

// 最初のページをチェック
checkPage(url, origin)

/*
 * 指定されたURLのリンクをチェックする
 *
 * @param {string} url 確認対象のURL
 * @param {string} origin 対象サイトのorigin
 *
 */
async function checkPage(url, origin) {
    const html = await getHtmlDom(url)
    const links = getLinkAll(html)
    const { links_inside, links_outside } = filteredLinkAll(links, origin)
    console.log(links_inside, links_outside)
    //const check_map = await check404(links_outside)
    //console.log(check_map)
}

function addPages(links) {
    links.forEach(link => {
        if(!links_inside.has(link)) {
            links_inside.set(link, undefined)
        }
    })
}
