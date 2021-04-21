项目安装npm  install   xlsx   --save
	npm install js-export-excel  --save

import moment from 'moment';
import React from 'react';
import nzh from 'nzh/cn';
import { parse, stringify } from 'qs';

import * as XLSX from 'xlsx';
import ExportJsonExcel from 'js-export-excel';
export function fixedZero(val) {
  return val * 1 < 10 ? `0${val}` : val;
}

export function getTimeDistance(type) {
  const now = new Date();
  const oneDay = 1000 * 60 * 60 * 24;

  if (type === 'today') {
    now.setHours(0);
    now.setMinutes(0);
    now.setSeconds(0);
    return [moment(now), moment(now.getTime() + (oneDay - 1000))];
  }

  if (type === 'week') {
    let day = now.getDay();
    now.setHours(0);
    now.setMinutes(0);
    now.setSeconds(0);

    if (day === 0) {
      day = 6;
    } else {
      day -= 1;
    }

    const beginTime = now.getTime() - day * oneDay;

    return [moment(beginTime), moment(beginTime + (7 * oneDay - 1000))];
  }

  if (type === 'month') {
    const year = now.getFullYear();
    const month = now.getMonth();
    const nextDate = moment(now).add(1, 'months');
    const nextYear = nextDate.year();
    const nextMonth = nextDate.month();

    return [
      moment(`${year}-${fixedZero(month + 1)}-01 00:00:00`),
      moment(moment(`${nextYear}-${fixedZero(nextMonth + 1)}-01 00:00:00`).valueOf() - 1000),
    ];
  }

  const year = now.getFullYear();
  return [moment(`${year}-01-01 00:00:00`), moment(`${year}-12-31 23:59:59`)];
}

export function getPlainNode(nodeList, parentPath = '') {
  const arr = [];
  nodeList.forEach(node => {
    const item = node;
    item.path = `${parentPath}/${item.path || ''}`.replace(/\/+/g, '/');
    item.exact = true;
    if (item.children && !item.component) {
      arr.push(...getPlainNode(item.children, item.path));
    } else {
      if (item.children && item.component) {
        item.exact = false;
      }
      arr.push(item);
    }
  });
  return arr;
}

export function digitUppercase(n) {
  return nzh.toMoney(n);
}

function getRelation(str1, str2) {
  if (str1 === str2) {
    console.warn('Two path are equal!'); // eslint-disable-line
  }
  const arr1 = str1.split('/');
  const arr2 = str2.split('/');
  if (arr2.every((item, index) => item === arr1[index])) {
    return 1;
  }
  if (arr1.every((item, index) => item === arr2[index])) {
    return 2;
  }
  return 3;
}

function getRenderArr(routes) {
  let renderArr = [];
  renderArr.push(routes[0]);
  for (let i = 1; i < routes.length; i += 1) {
    // 去重
    renderArr = renderArr.filter(item => getRelation(item, routes[i]) !== 1);
    // 是否包含
    const isAdd = renderArr.every(item => getRelation(item, routes[i]) === 3);
    if (isAdd) {
      renderArr.push(routes[i]);
    }
  }
  return renderArr;
}

/**
 * Get router routing configuration
 * { path:{name,...param}}=>Array<{name,path ...param}>
 * @param {string} path
 * @param {routerData} routerData
 */
export function getRoutes(path, routerData) {
  let routes = Object.keys(routerData).filter(
    routePath => routePath.indexOf(path) === 0 && routePath !== path
  );
  // Replace path to '' eg. path='user' /user/name => name
  routes = routes.map(item => item.replace(path, ''));
  // Get the route to be rendered to remove the deep rendering
  const renderArr = getRenderArr(routes);
  // Conversion and stitching parameters
  const renderRoutes = renderArr.map(item => {
    const exact = !routes.some(route => route !== item && getRelation(route, item) === 1);
    return {
      exact,
      ...routerData[`${path}${item}`],
      key: `${path}${item}`,
      path: `${path}${item}`,
    };
  });
  return renderRoutes;
}

export function getPageQuery() {
  return parse(window.location.href.split('?')[1]);
}

export function getQueryPath(path = '', query = {}) {
  const search = stringify(query);
  if (search.length) {
    return `${path}?${search}`;
  }
  return path;
}

/* eslint no-useless-escape:0 */
const reg = /(((^https?:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+(?::\d+)?|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)$/;

export function isUrl(path) {
  return reg.test(path);
}

export function formatWan(val) {
  const v = val * 1;
  if (!v || Number.isNaN(v)) return '';

  let result = val;
  if (val > 10000) {
    result = Math.floor(val / 10000);
    result = (
      <span>
        {result}
        <span
          style={{
            position: 'relative',
            top: -2,
            fontSize: 14,
            fontStyle: 'normal',
            marginLeft: 2,
          }}
        >
          万
        </span>
      </span>
    );
  }
  return result;
}

// 给官方演示站点用，用于关闭真实开发环境不需要使用的特性
export function isAntdPro() {
  return window.location.hostname === 'preview.pro.ant.design';
}

export const importCDN = (url, name) =>
  new Promise(resolve => {
    const dom = document.createElement('script');
    dom.src = url;
    dom.type = 'text/javascript';
    dom.onload = () => {
      resolve(window[name]);
    };
    document.head.appendChild(dom);
  });

export const getValue = obj =>
  Object.keys(obj)
    .map(key => obj[key])
    .join(',');

export const success = response => response !== 'undefined' && !response._code;

export const imagePath = identifying => `http://${window.location.host}/api/api-file/v1/images/show?identifying=${identifying}`;

export const filePath = identifying => `http://${window.location.host}/api/api-file/v1/file/download?identifying=${identifying}`;

export const downloadPath = path => `http://${window.location.host}/api/api-file/v1/file/downloadPath?path=${path}&access_token=${sessionStorage.getItem("access_token")}`;

export const  getOffset = (evt) => {
  if( evt.offsetX ) return evt.offsetX;
  let ele = evt.target || evt.srcElement;
  let o = ele;

  let x=0;
  let y=0;
  while( o.offsetParent )
  {
    x += o.offsetLeft;
    y += o.offsetTop;
    o=o.offsetParent;
  }
  // 处理当元素处于滚动之后的情况
  let left = 0;
  let top = 0;
  while( ele.parentNode )
  {
    left += ele.scrollLeft;
    top += ele.scrollTop;
    ele=ele.parentNode;
  }

  return {x:evt.pageX + left - x,y:evt.pageY + top - y};
}

export const guid = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// 对象转MAP
export const objChangeMap = (obj) => {
  let map = new Map();
  for(let key in obj) {
    map.set(key,obj[key]);
  }
  return map;
}
// 多条件查询
export const moreQueryJson = (columns,values) => {
  const columnsMap = new Map();
  columns.map(o=>{
    if(o.operator){
      columnsMap.set(o.dataIndex,o.operator)
    }
  });
  const jsonList = [];
  Object.keys(values).filter(k=>values[k]!==undefined).map(k=>{
    if(columnsMap.has(k)){
      const operator = columnsMap.get(k)
      const v = values[k];
      if(v instanceof Array){
        let begin = v[0];
        let end = v[1];
        if(begin.hasOwnProperty('_isAMomentObject')){
          begin = begin.format('YYYY-MM-DD')
        }
        if(end.hasOwnProperty('_isAMomentObject')){
          end = end.format('YYYY-MM-DD')
        }
        jsonList.push({
          field: k,
          operator: operator,
          begin,
          end,
        })
      }else {
        jsonList.push({
          field: k,
          operator: operator,
          value: values[k],
        })
      }
    }
  })
  return jsonList;
}
// 查询控件转换
export const queryComponent = (columns) => {
  return columns.map(temp=>{
    const o = {...temp};
    if(o.queryComponent){
      o.component = o.queryComponent;
    }
    o.isCreate = true;
    o.formType = '';
    return o;
  })
}

export const encodeBase64Content = (commonContent) => {
  let base64Content = Buffer.from(commonContent).toString('base64');
  return base64Content;
}


//引入xlsx
/**
 * 导入excel的函数
 * @param {*} file 
 */
 export const importsExcel=(file)=>{
  //使用promise导入
return  new Promise((resolve,reject)=>{
   // 获取上传的文件对象
   const { files } = file.target; //获取里面的所有文件
   // 通过FileReader对象读取文件
   const fileReader = new FileReader();

   fileReader.onload = event => { //异步操作  excel文件加载完成以后触发
       try {
           const { result } = event.target;
           // 以二进制流方式读取得到整份excel表格对象
           const workbook = XLSX.read(result, { type: 'binary' });
           let data = []; // 存储获取到的数据
           // 遍历每张工作表进行读取（这里默认只读取第一张表）
           for (const sheet in workbook.Sheets) {
               if (workbook.Sheets.hasOwnProperty(sheet)) {
                    data = data.concat(XLSX.utils.sheet_to_json(workbook.Sheets[sheet]));
               }
           }
           resolve(data);//导出数据
       } catch (e) {
           // 这里可以抛出文件类型错误不正确的相关提示
          reject("失败");//导出失败
       }
   };
   // 以二进制方式打开文件
   fileReader.readAsBinaryString(files[0]);
})

}
/**
* 导出excel
* @param {*} headers 
* @param {*} data 
* @param {*} fileName 
*/
export const  exportExcel =(headers, data, fileName = 'demo.xlsx')=>{

  const _headers = headers
  .map((item, i) => Object.assign({}, { key: item.key, title: item.title, position: String.fromCharCode(65 + i) + 1 }))
  .reduce((prev, next) => Object.assign({}, prev, { [next.position]: { key: next.key, v: next.title } }), {});
const _data = data
  .map((item, i) => headers.map((key, j) => Object.assign({}, { content: item[key.key], position: String.fromCharCode(65 + j) + (i + 2) })))
  // 对刚才的结果进行降维处理（二维数组变成一维数组）
  .reduce((prev, next) => prev.concat(next))
  // 转换成 worksheet 需要的结构
  .reduce((prev, next) => Object.assign({}, prev, { [next.position]: { v: next.content } }), {});

// 合并 headers 和 data
const output = Object.assign({}, _headers, _data);
// 获取所有单元格的位置
const outputPos = Object.keys(output);
// 计算出范围 ,["A1",..., "H2"]
const ref = `${outputPos[0]}:${outputPos[outputPos.length - 1]}`;

// 构建 workbook 对象
const wb = {
  SheetNames: ['mySheet'],
  Sheets: {
      mySheet: Object.assign(
          {},
          output,
          {
              '!ref': ref,
              '!cols': [{ wpx: 45 }, { wpx: 100 }, { wpx: 200 }, { wpx: 80 }, { wpx: 150 }, { wpx: 100 }, { wpx: 300 }, { wpx: 300 }],
          },
      ),
  },
};

// 导出 Excel
XLSX.writeFile(wb, fileName);
}