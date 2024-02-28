import axios from 'axios'

export async function ttSearch(query) {
  return new Promise(async(resolve,reject) => {

axios("https://tikwm.com/api/feed/search", {
  headers: {
    "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
    "cookie": "current_language=en",
    "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36"
  },
  data: {
    "keywords": query,
    "count": 12,
    "cursor": 0,
    "web": 1,
     "hd": 1
   },
  "method": "POST"
}).then(res => { 
 resolve(res.data.data) 
})
})
}
