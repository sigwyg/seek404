import { setTimeout } from "https://deno.land/std@0.147.0/node/timers.ts";
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

const url: string = Deno.args[0]
const origin: string = url.match(/https?:\/\/[^/]+\//)[0];
console.table({ url, origin })

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

/**
 * 再帰チェック
 */
let counter = 1
async function checkSite() {
    let check_page = ''
    pages.forEach((value, key) => {
        if(value === 0) check_page = key
        if(!checked[key]) check_page = key
    })
    if(check_page) {
        console.log(counter++, check_page)

        // disabled
        const patterns = [
            new RegExp(/clients\/prefectures/),
            new RegExp(/\?prefecture_id=/),
        ]
        patterns.forEach(pattern => {
            if(pattern.test(check_page)){
                console.error("skip!")
                checked[check_page] = 500
                pages.set(check_page, 500)
                setTimeout(checkSite, 1000)
                return
            }
        })

        // check page
        checkPage(check_page, origin).then((res) => {
            setTimeout(checkSite, 1000)
        }).catch(err => {
            console.error("failed!")
            checked[check_page] = 500
            pages.set(check_page, 500)
            setTimeout(checkSite, 1000)
            return
        })
    } else {
        console.log(checked)
    }
}
await checkPage(url, origin)
checkSite()
//while(Array.from(pages.values()).some(elm => elm === 0)) {
//}

//await checkPage("https://", origin)
//console.log(checked)

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
    const check_outside = await check404( links_outside )
    unionMap(outLinks, check_outside)

    // サイト内リンクは再帰処理に使うので、少し工夫する
    //const check_inside = await check404( links_inside )
    //unionMap(pages, check_inside)
    links_inside.forEach(link => {
        if(!pages.has(link)) { pages.set(link, 0) }
    })
    if(pages.has(url)) {
        pages.set(url, 200)
    }

    let checked_links = new Map()
    //unionMap(checked_links, check_inside)
    unionMap(checked_links, check_outside)
    checked[url] = {
        status: 200,
        links: checked_links
    }
    //console.log(checked)
}

/**
 * Mapを結合する
 * @param {Map} map マージされるMap
 * @param {Map} mergedMap マージするMap
 */
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
