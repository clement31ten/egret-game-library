/**
 * Copyright (c) Egret-Labs.org. Permission is hereby granted, free of charge,
 * to any person obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish, distribute,
 * sublicense, and/or sell copies of the Software, and to permit persons to whom
 * the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
 * PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE
 * FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
 * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/// <reference path="../../egret.d.ts"/>
/// <reference path="AnalyzerBase.ts"/>
/// <reference path="../core/ResourceItem.ts"/>

module RES {

	export class BinAnalyzer extends AnalyzerBase{
		/**
		 * 构造函数
		 */		
		public constructor(){
			super();
		}
		
		/**
		 * 字节流数据缓存字典
		 */		
		public fileDic:any = {};
		/**
		 * 加载项字典
		 */		
		public resItemDic:Array<any> = [];
		/**
		 * @inheritDoc
		 */
		public loadFile(resItem:ResourceItem,compFunc:Function,thisObject:any):void{
			if(this.fileDic[resItem.name]){
				compFunc.call(thisObject,resItem);
				return;
			}
			var loader:ns_egret.URLLoader = this.getLoader();
			this.resItemDic[loader.hashCode] = {item:resItem,func:compFunc,thisObject:thisObject};
			loader.load(new ns_egret.URLRequest(resItem.url));
		}

        public _dataFormat:string = ns_egret.URLLoaderDataFormat.BINARY;
		/**
		 * URLLoader对象池
		 */		
		public recycler:ns_egret.Recycler = new ns_egret.Recycler();
		/**
		 * 获取一个URLLoader对象
		 */		
		private getLoader():ns_egret.URLLoader{
			var loader:ns_egret.URLLoader = this.recycler.pop();
			if(!loader){
				loader = new ns_egret.URLLoader();
				loader.dataFormat = this._dataFormat;
				loader.addEventListener(ns_egret.Event.COMPLETE,this.onLoadFinish,this);
				loader.addEventListener(ns_egret.IOErrorEvent.IO_ERROR,this.onLoadFinish,this);
			}
			return loader;
		}
		/**
		 * 一项加载结束
		 */		
		private onLoadFinish(event:ns_egret.Event):void{
			var loader:ns_egret.URLLoader = <ns_egret.URLLoader> (event.target);
			var data:any = this.resItemDic[loader.hashCode];
			delete this.resItemDic[loader.hashCode];
			this.recycler.push(loader);
			var resItem:ResourceItem = data.item;
			var compFunc:Function = data.func;
			resItem.loaded = (event.type==ns_egret.Event.COMPLETE);
			if(resItem.loaded){
                this.onLoadComplete(resItem.name,loader.data)
			}
			compFunc.call(data.thisObject,resItem);
		}
        /**
         * 一项加载成功
         */
        public onLoadComplete(name:string,data:any):void{
            if(this.fileDic[name]||!data){
                return;
            }
            this.fileDic[name] = data;
        }
		/**
		 * @inheritDoc
		 */
		public getRes(name:string):any{
			return this.fileDic[name];
		}
		/**
		 * @inheritDoc
		 */
		public hasRes(name:string):boolean{
			return this.fileDic[name]!=null;
		}
		/**
		 * @inheritDoc
		 */
		public destroyRes(name:string):boolean{
			if(this.fileDic[name]){
				delete this.fileDic[name];
				return true;
			}
			return false;
		}
	}
}