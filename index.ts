import { DOMParser } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";


/**
 * getHtmlDom()
 * urlを受け取って、DOMを返す
 * 
 * @param {string} url対象サイトのURL
 * @return {dom} 対象サイトの、DOM解析済みのオブジェクト
 *
 */
async function getHtmlDom(url) {
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
function getLinkAll(dom) {
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
 * @return {string[]} サイト内リンク
 *
 */
function filteredLinkAll(urls, origin) {
    const filtered_urls = urls.map(url => {
        // 相対/絶対リンクならoriginを付加する
        // @example "./about" -> "http://google.com/about"
        const regexp_inside = new RegExp(/^\.?\//)
        if(regexp_inside.test(url)) {
            url = url.replace(regexp_inside, "")
            origin = origin.replace(/[^/]$/, "/")
            url = origin + url
        }

        // http...でoriginと一致するなら返却
        const regexp = new RegExp(origin)
        if(regexp.test(url)) { return url }

        return ""
    })
    return filtered_urls.filter(Boolean)
}

const url = "https://gaiheki-madoguchi.com/"
const origin_url = url.match(/https?:\/\/[^/]+\//)[0];

const html = await getHtmlDom(url)
const links = getLinkAll(html)

let links_inside = new Map()
links_inside = filteredLinkAll(links, origin_url)
console.log(links_inside)
