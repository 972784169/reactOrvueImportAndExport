import * as XLSX from 'xlsx';
import ExportJsonExcel from 'js-export-excel';

import {
  importsExcel,
  exportExcel
} from '@/utils/utils';

/** 
   * 不掉后台导出excel，
   *  前台利用import * as XLSX from 'xlsx';
   * import ExportJsonExcel from 'js-export-excel';实现
 */
  downloadFileToExcel = () => {
    const {
      Xbbf20215: { tableData },
    } = this.props;
    console.log('------------->')
    let option = {};  //option代表的就是excel文件
    option.fileName = '报警措施表' + new Date().valueOf();  //excel文件名称
    option.datas = [
      {
        sheetData: tableData,  //excel文件中的数据源
        sheetName: '报警措施表',  //excel文件中sheet页名称
        sheetFilter: ['alarmTime', 'alarmItem', 'alarmCount', 'problemAnalysic',
          'treatmentMeasure'],  //excel文件中需显示的列数据
        sheetHeader: ["报警时间", "报警项", "报警时间(h)", "问题分析",
          "处理措施"],  //excel文件中每列的表头名称
      }
    ];
    let toExcel = new ExportJsonExcel(option);  //生成excel文件
    toExcel.saveExcel();  //下载excel文件
  };
//导入
downLoadImportExcel=(e)=>{
  importsExcel(e).then(function(data){
    console.log(JSON.stringify(data));
    //actionList(data);
},function(data){
    console.log(data);
})

<div>
                <input type="file" accept=".xls,.xlsx"  onChange={(e)=>{
                    this.downLoadImportExcel(e)
            }}/>
                  </div>



 <Button type="primary" onClick={this.downloadFileToExcel}>导出</Button>