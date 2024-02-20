let dataList =[]
let totalResults 
let totalGroupPages
let searching = false;

let page =1
let pageSize = 10 
let groupSize =5
let group   // 리스트자료 [1,2,3,4,5] 식
let groups  // [ [1,2,3,4,5], [6,7,8,9,10],......]
let groupIndex =0;
let currentIndex = 0;    

const replaceImage = 'noonatimes.png'
const input = document.querySelector('#search-input')

let country ='kr'
// let url = `https://newsapi.org/v2/top-headlines?country=kr&apiKey=${apiKey}`;
let url3 = 'http://times-node-env.eba-appvq3ef.ap-northeast-2.elasticbeanstalk.com/top-headlines'
// let url3 = `https://chic-nasturtium-fd9a30.netlify.app/top-headlines`


//! 실행 코드
render()





function makeGroups(results){   // 들어오는 리절트에 따라서 그룹이 달라진다.
    totalGroupPages = Math.ceil(results / pageSize)
    groups =[]
    let list =[]
    for(let i=1; i<=totalGroupPages; i++){
        list.push(i)
        if( i % groupSize == 0){   // 일단 groupSize 5로 가정
            groups.push([...list])  // 이렇게 독립해야
            list =[]               // list를 변화시켜도 영향 안받는다.
        } 
    }
    if(list.length > 0){
        groups.push([...list])
    }
    return groups
}

function makePaginationHTML(groupIndex){   // 1, 2, 3...
    if(totalResults == 0){
        return;
    }

    const currentGroup = groupIndex      // nextGroup을 다루기 위해 변수 필요
    group = groups[currentGroup]  // 첫번째 그룹은 groups[0]  
                       // [1,2,3,4,5] 혹은 [6,7,8,9,10]
    let paginationHTML =`<li class="prev-li"><button class="page-btn" id="prev-page" onclick="moveToPage('prev page')">prev page</button></li><li class="page-li"><button class="page-btn" id="prev" onclick="moveToPage(${page-1})">Prev</button></li>`;
    // page가 전역변수라서 page-1 이 최신페이지에서 이전페이지가 된다.
    
    paginationHTML +=  group.map(i => {
        return `<button class="page-btn" id="page" onclick="moveToPage(${i})">${i}</button>`
        }).join('')

    paginationHTML += `<li class="next-li"><button class="page-btn" id="next" onclick="moveToPage(${page+1})">Next</button></li><li class="next-li"><button class="page-btn" id="next-page" onclick="moveToPage('next page')">next page</button><span>${page} of ${totalGroupPages} pages</span></li>`

    return paginationHTML;
}

function moveToPage(pageNo){
    console.log('clicked!')
    if(pageNo == 'prev page'){
        groupIndex--
        group = groups[groupIndex]
        page = group[0]
        currentIndex = 0
    } else if(pageNo == 'next page'){
        groupIndex++
        group = groups[groupIndex]
        page = group[0]
        currentIndex =0
    } else {
        page = pageNo;   
        currentIndex = group.indexOf(page)
    } 
    query.page = page;

    render() 
}


async function render(){
    const data = await getNews()  
    totalResults = data.totalResults;
    dataList = data.articles;

    // currentIndex =0;
    totalGroupPages = Math.ceil(totalResults / pageSize)
    groups = makeGroups(totalResults)

    if (totalResults == 0){  // 중복 불필요. 나중에 지운다.
        alert('해당 기사는 없습니다.')
        return;
    } // 아무 것도 안한다.
    
    
    const newsBoard = document.querySelector('#news-board')
    newsBoard.innerHTML =''; //비우고 시작
    const pagination = document.querySelector('.pagination');
    pagination.innerHTML =''// 기존내용 삭제

    let newsHTML = '';
    if(dataList.length == 1){      //  [{url: ..}] 형태
        const [news] = dataList;
        newsHTML = `
            <div class="row item">
                <div class="col-lg-4">
                    <img src=${news.urlToImage || replaceImage}  />
                </div>
                <div class="col-lg-8">
                    <h2 class='title' onclick="getDetail('${news.url}')">${news.title}</h2>
                    <p class='content'>${news.content || news.description}</p>
                    <div>${news.source.name} : ${news.publishedAt}</div>
                </div>
            </div>
        `;
    } else{
        for (let i = 0; i < dataList.length; i++) {
            const news = dataList[i];
            newsHTML += `
                <div class="row item">
                    <div class="col-lg-4">
                        <img src=${news.urlToImage || replaceImage}  />
                    </div>
                    <div class="col-lg-8">
                        <h2 class='title' onclick="getDetail('${news.url}')">${news.title}</h2>
                        <p class='content'>${news.content || news.description}</p>
                        <div>${news.source.name} : ${news.publishedAt}</div>
                    </div>
                </div>
            `;
        }
    }
    newsBoard.innerHTML = newsHTML;
    pagination.innerHTML =  makePaginationHTML(groupIndex)

    console.log('page :', page)
    console.log('currentIndex :', currentIndex)
    console.log('groupIndex :', groupIndex)
    console.log('group :', group)


    // 바뀐 버튼 상태를 반영하기
    const prev = document.querySelector('#prev')
    const prevPage = document.querySelector('#prev-page')
    const next = document.querySelector('#next')
    const nextPage = document.querySelector('#next-page')

    const endIndexOfTheGroup = group.length-1  //해당그룹의 마지막 인덱스

    // prev next 등 비활성화 여부
    if(group.length ==1){  
        // 단 한개의 아이템만 있는 경우
        prev.disabled = true;
        next.disabled = true;
        prevPage.disabled =true;
        nextPage.disabled =true;
    }
    if(group.length <= groupSize){
        nextPage.disabled = true;
    }
    if(groups.length > groupIndex+1){
        nextPage.disabled = false;
    }

    if(currentIndex ==0){
        prev.disabled =true;
        
    } else if(currentIndex == endIndexOfTheGroup){
        next.disabled = true;
    } 
    if(groupIndex ==0){
        prevPage.disabled = true;
    } else if(groupIndex == groups.length-1){
        nextPage.disabled = true;
    }

    // 현재 페이지 버튼 활성화(진하게)
    const pageButtons = document.querySelectorAll('.page-btn')
    for( let pageButton of pageButtons){
        if(pageButton.innerText == page.toString()){
            pageButton.classList.add('active')
        } else{
            pageButton.classList.remove('active')
        }
    }
    //모든 쿼리를 초기화
    
}

function getDetail(url){
    window.location.href = url;
}


function search(){
    const keyword = input.value;
    url3 =`http://times-node-env.eba-appvq3ef.ap-northeast-2.elasticbeanstalk.com/top-headlines?country=${country}&q=${keyword}` 
    render()
    input.value ='' // 인풋 리셋
}
function search2(){
    const keyword = input.value;
    const e = window.event; 
    if (e.key =='Enter'){
        url3 =`http://times-node-env.eba-appvq3ef.ap-northeast-2.elasticbeanstalk.com/top-headlines?country=${country}&q=${keyword}` 
        render()
        input.value ='' // 인풋 리셋
    } 
}

function getCategory(카테고리){
    url3 =`http://times-node-env.eba-appvq3ef.ap-northeast-2.elasticbeanstalk.com/top-headlines?country=${country}&category=${카테고리}`; 
    render()
}

async function getNews(){
    const newsUrl = new URL(url3);
    newsUrl.searchParams.set("page",page)  // &page=page
    newsUrl.searchParams.set("pageSize",pageSize) //&pageSize=pageSize
    try{
        const response = await fetch(newsUrl);  
        const data = await response.json()
        if (response.status == 200){
            console.log('data : ', data);
            if(data.articles.length == 0){                
                throw new Error('No result for this search');
            }
            // const list = data.articles;
            // console.log('list :', list)
            return data;            
        } else{
            throw new Error('예상 못한 에러를 만났습니다.')
        }

    } catch(e){
        console.log(e.message)
        errorRender(e.message)
    }   
}