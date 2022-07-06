import { DOMParser } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";

async function getHtmlDom(url) {
    const response = await fetch(url).catch((err) => {
        console.error("URL parse failed!")
    })

    const html_text = await response.text()
    const dom = new DOMParser().parseFromString(html_text, "text/html");
    if (!dom) { throw new Error("DOM parse failed"); }

    return dom
}

function getLinksText(dom, origin_url) {
    const urls = []
    dom.querySelectorAll("a").forEach((link) => {
        urls.push(link.getAttribute("href"))
    });
    const filtered_urls = urls.filter(url => {
        const regexp = new RegExp(origin_url)
        if(regexp.test(url)) { return true }

        if(url.match(/^\.?\//)) { // 相対リンクか絶対リンク
            return true
        }

        return false
    })
    return filtered_urls
}

const url = "https://gaiheki-madoguchi.com/"
const html = await getHtmlDom(url)
const origin_url = url.match(/https?:\/\/[^/]+\//)[0];
const site_links = getLinksText(html, origin_url)
console.log(site_links)
