// 创建一个具有正确NCM文件头的测试文件
const fs = require('fs');

// NCM文件头 "CTENFDAM" 的十六进制表示
const ncmHeader = Buffer.from('CTENFDAM', 'utf8');

// 创建一些测试数据
const testData = Buffer.from('This is test data for NCM file', 'utf8');

// 合并文件头和测试数据
const ncmData = Buffer.concat([ncmHeader, testData]);

// 写入文件
fs.writeFileSync('real_test.ncm', ncmData);

console.log('Real NCM test file created: real_test.ncm');