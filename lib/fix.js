/**
 * 在es6-shim中，有如下代码:
 * if(!"Reflect" in globals) {
 *   defineProperty(globals, "Reflect", {});
 * }
 * 这会导致defineProperty的调用被加到事件列表的最后
 * 而在angular2-polyfill中的第一行:
 * var Reflect;
 * 这是在假设Reflect已经在全局下定义。当javascript文件分别加载时，Reflect会被shim定义为空对象
 * 但是在源文件concat以后，会导致这一行在defineProperty调用前执行。
 *
 * 随后在defineProperty中检查Reflect是否存在时，结果为真，导致函数直接返回
 * 但其实Reflect的值为Undefined
 *
 * 这一行代码会在所有库加载前在global下定义Reflect并赋值为空变量
 */
var Reflect = {};
