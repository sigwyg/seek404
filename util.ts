/**
 * getHtmlDom()
 * urlを受け取って、DOMを返す
 * 
 * @param {string} url対象サイトのURL
 * @return {dom} 対象サイトの、DOM解析済みのオブジェクト
 *
 */
import { DOMParser } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";
export async function getHtmlDom(url) {
    const response = await fetch(url).catch((err) => {
        console.error("URL parse failed!")
    })

    const html_text = await response.text()
    const dom = new DOMParser().parseFromString(html_text, "text/html");
    if (!dom) { throw new Error("DOM parse failed"); }

    return dom
}


/**
 * getLinkAll()
 * WebページのDOMから、a[href]を抜き出して返却
 * 
 * @param {DOM} dom 対象サイトの、DOM解析済みのオブジェクト
 * @return {string[]} サイト内リンクの一覧
 *
 */
export function getLinkAll(dom) {
    const urls = []
    dom.querySelectorAll("a").forEach((link) => {
        urls.push(link.getAttribute("href"))
    });
    return urls
}

/**
 * filtererdLinkAll()
 * リンクリストから、サイト内リンクを抜き出す
 * 
 * @param {string[]} urls a[href]の中身
 * @param {string} origin 対象サイトのorigin
 * @return {string[]} サイト内リンク, サイト外リンク
 *
 */
export function filteredLinkAll(urls, origin) {
    const links_inside = []
    const links_outside = []

    urls.forEach(url => {
        // 相対/絶対リンクならoriginを付加する
        // @example "./about" -> "http://google.com/about"
        const regexp_inside = new RegExp(/^\.?\//)
        if(regexp_inside.test(url)) {
            url = url.replace(regexp_inside, "")
            origin = origin.replace(/[^/]$/, "/")
            url = origin + url
        }

        // http...でoriginと一致するならサイト内リンク
        const regexp = new RegExp(origin)
        if(regexp.test(url)) {
            links_inside.push(url)
            return
        }

        // httpプロトコルに限定
        // - tel, #, javascriptなどを除外
        if(/https?:\/\//.test(url)) {
            links_outside.push(url)
        }
    })

    return {links_inside, links_outside}
}

/**
 * check404()
 * リンクリストをfetchして、statusをチェックする
 * 
 * @param {string[]} urls リンクリスト
 * @return {Map} リンクリストをkey、status codeをvalueとしてもの
 *
 */
export async function check404(urls) {
    const results = await Promise.all(
        urls.map(async (url) => {
            const result = await fetch(url)
            return [ url, result.status ]
        })
    )
    let checked = new Map()
    results.forEach(result => {
        checked.set(result[0], result[1])
    })
    return checked
}
