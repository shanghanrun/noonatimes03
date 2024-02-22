let newsList =[]
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
let gotError = false;    

const replaceImage = 'noonatimes.png'
const input = document.querySelector('#search-input')

let country ='kr'
// let url = `https://newsapi.org/v2/top-headlines?country=kr&apiKey=${apiKey}`;
// let url2 = 'http://times-node-env.eba-appvq3ef.ap-northeast-2.elasticbeanstalk.com/top-headlines'
let url3 = `https://chic-nasturtium-fd9a30.netlify.app/top-headlines`


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

    paginationHTML += `<li class="next-li"><button class="page-btn" id="next" onclick="moveToPage(${page+1})">Next</button></li><li class="next-li"><button class="page-btn" id="next-page" onclick="moveToPage('next page')">next page</button><span>${page} of </span><span id="accent">${totalGroupPages} pages</span></li>`

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

    render() 
}


async function render(){
    const data = await getNews()
    if(gotError){
        return; // --> 이미 getNews에서 실행한 errorRender()로 충분하다.
    }  
    totalResults = data.totalResults;
    newsList = data.articles;

    // currentIndex=0 ;  초기화하면 안된다.
    totalGroupPages = Math.ceil(totalResults / pageSize)
    groups = makeGroups(totalResults)

    const date = document.querySelector('#date')
    date.innerHTML = today();
    
    const newsBoard = document.querySelector('#news-board')
    newsBoard.innerHTML =''; //비우고 시작
    const pagination = document.querySelector('.pagination');
    pagination.innerHTML =''// 기존내용 삭제

    let newsHTML = '';
    if(newsList.length == 1){      //  [{url: ..}] 형태
        const [news] = newsList;
        newsHTML = `
            <div class="row item">
                <div class="col-lg-4">
                    <img id="news-image" src=${news.urlToImage || replaceImage} onerror="imgError(this)" />
                </div>
                <div class="col-lg-8">
                    <h2 class='title' onclick="getDetail('${news.url}')">${news.title}</h2>
                    <p class='content'>${news.description || news.content}</p>
                    <div>${news.source.name} : ${news.publishedAt}</div>
                </div>
            </div>
        `;
    } else{
        for (let i = 0; i < newsList.length; i++) {
            const news = newsList[i];
            newsHTML += `
                <div class="row item">
                    <div class="col-lg-4">
                        <img id="news-image" src=${news.urlToImage || replaceImage} onerror="imgError(this)" />
                    </div>
                    <div class="col-lg-8">
                        <h2 class='title' onclick="getDetail('${news.url}')">${news.title}</h2>
                        <p class='content'>${news.description || news.content}</p>
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
        // 현재 5 그룹페이지(groupIndex 4 + 1)   groups =[[1][2][3][4][*5*][6]] 
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
}

function getDetail(url){
    window.location.href = url;
}
function errorRender(message){
    const newsBoard = document.querySelector('#news-board')
    newsBoard.innerHTML ='';
    const errorHTML = `
        <div class="alert alert-danger" role="alert">
            ${message}
        </div>
    `;
    newsBoard.innerHTML= errorHTML;
    document.querySelector('.pagination').innerHTML = ""
}

function search(){
    initializeSettings()
    const keyword = input.value;
    url3 =`https://chic-nasturtium-fd9a30.netlify.app/top-headlines?country=${country}&q=${keyword}` 
    render()
    input.value ='' // 인풋 리셋
}
// function search2(){
//     const keyword = input.value;
//     const e = window.event; 
//     console.log(e.key)
//     if (e.key =='Enter'){
//         console.log('enter')
//         url3 =`https://chic-nasturtium-fd9a30.netlify.app/top-headlines?country=${country}&q=${keyword}` 
//         render()
//         input.value ='' // 인풋 리셋
//     } 
// }

function getCategory(카테고리){
    initializeSettings()

    // 모든 버튼에서 selected 클래스를 제거
    var buttons = document.querySelectorAll('.menus button');

    buttons.forEach(function(button) {
        if(button.classList.contains('selected')){
            button.classList.remove('selected');
        }
    });
    
    // 클릭된 버튼에 selected 클래스 추가
    var clickedButton = document.getElementById(카테고리);
    clickedButton.classList.add('selected');

    url3 =`https://chic-nasturtium-fd9a30.netlify.app/top-headlines?country=${country}&category=${카테고리}`; 
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
            return data;            
        } else{
            throw new Error('예상 못한 에러를 만났습니다.')
        }

    } catch(e){
        gotError = true;
        console.log(e.message)
        errorRender(e.message)
        gotError = false;
    }   
}

function today(){
    const now = new Date();
    const year = now.getFullYear(); 
    const month = String(now.getMonth() + 1).padStart(2, '0'); 
    // 월을 가져오고 0을 붙여 두 자리로 만듭니다.
    const day = String(now.getDate()).padStart(2, '0'); // 일을 가져오고 0을 붙여 두 자리로 만듭니다.

    const formattedDate = `${year}-${month}-${day}`;
    return formattedDate
}


function initializeSettings(){
    page = 1
    pageSize = 10
    groupSize =5
    group =[]
    groups =[]
    groupIndex =0;
    currentIndex = 0;
}

function imgError(image){
    image.onerror = null; // 이미지 에러 핸들러를 중복호출하지 않도록 이벤트 리스너를 제거한다.
    image.src = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqEWgS0uxxEYJ0PsOb2OgwyWvC0Gjp8NUdPw&usqp=CAU";
}

function toggleInput(){
    const searchIcon = document.querySelector('#search-icon')
    const searchInput = document.querySelector('#search-input')
    const searchButton = document.querySelector('#search')

    if(searchIcon.style.color =='rgb(126, 154, 253)'){
        searchIcon.style.color = 'pink'
    } else{
        searchIcon.style.color = 'rgb(126, 154, 253)'
    }

    if(searchInput.style.display== 'none'){
        searchInput.style.display = 'inline';
    } else{
        searchInput.style.display = 'none';
    }
    if(searchButton.style.display == 'none'){
        searchButton.style.display = 'inline';
    } else{
        searchButton.style.display = 'none';
    }
}