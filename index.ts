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

const url: string = "https://gaiheki-madoguchi.com/"
const origin: string = url.match(/https?:\/\/[^/]+\//)[0];


/*
{
    "https://example.com/": {
        status: 200,
        links: Map {
            "https://google.com/" => 200,
            "https://google.com/about/" => 404,
            ...
        }
    },
    "https://example.com/contact": {
    ...
}
*/
interface Checked {
    [key: string]: {
        status: number,
        links?: Map<string, number>
    }
}
const checked: Checked = {
    [url]: {
        status: 0,
    },
}
let pages = new Map<string, number>()
let outLinks = new Map<string, number>()
pages.set(url, 0)

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

    // fetchするので、無駄な処理に注意
    const check_inside = await check404( links_inside )
    unionMap(pages, check_inside)
    const check_outside = await check404( links_outside )
    unionMap(outLinks, check_outside)

    let checked_links = new Map()
    unionMap(checked_links, check_inside)
    unionMap(checked_links, check_outside)
    checked[url] = {
        status: 200,
        links: checked_links
    }
}

function addPages(links) {
    links.forEach(link => {
        if(!links_inside.has(link)) {
            links_inside.set(link, undefined)
        }
    })
}

function unionMap (map, mergedMap) {
    mergedMap.forEach((value, key) => {
        map.set(key, value)
    })
}

/*
 * @param {string[]} arr チェックしたいURL
 * @param {map<string, number>} map Map(url, status_code)
 * @return {string[]} 未チェックのURL一覧
 */
function checkMapDuplicate(arr, map) {
    return arr.filter(link => {
        if(map.has(link) && map[link] !== 0) {
            return false
        }
        return true
    })
}
