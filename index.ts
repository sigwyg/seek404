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
    return urls
}

const url = "https://gaiheki-madoguchi.com/"
const html = await getHtmlDom(url)
const site_links = getLinksText(html, origin_url)
console.log(site_links)
