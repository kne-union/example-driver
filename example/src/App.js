import ExampleDriver from '@kne/example-driver';
import * as ReactFetch from '@kne/react-fetch';

const App = () => {
    return <ExampleDriver list={[
        {
            "title": "基本用法",
            "description": "注意：react-fetch 内部处理请求的时候只通过 code,msg,results来作为内部逻辑，code为200判定为请求成功，不为200时判定为错误，msg会传入到error组件，拿到results后，会将results作为业务组件的data属性\n如果后端的返回不满足上诉格式，需要在preset的transformResponse方法做转换适配\najax为一个axios实例，每个实例的拦截器可能不同，默认会在内部自动创建一个axios实例，但是没有任何拦截器，如果想给其添加拦截器，可以自行创建axios实例通过preset设置\npreset 可以单独放一个文件里，在入口文件顶部引入",
            "isFull": false,
            "scope": [
                {
                    "name": "ReactFetch",
                    "packageName": "@kne/react-fetch",
                    "component":ReactFetch
                }
            ],
            "code": "const {createWithFetch, preset} = ReactFetch;\n\npreset({\n    ajax: (config) => {\n        console.log(config);\n        return new Promise((resolve) => {\n            setTimeout(() => {\n                resolve({\n                    data: {\n                        code: 0,\n                        data: [\n                            {title: '数据一'},\n                            {title: '数据二'}\n                        ]\n                    }\n                });\n            }, 1000);\n        });\n    },\n    loading: 'loading....',\n    empty: '空',\n    transformResponse: (response) => {\n        const {data} = response;\n        response.data = {\n            code: data.code === 0 ? 200 : data.code, msg: data.msg, results: data.data\n        };\n        return response;\n    }\n});\n\nconst Remote = createWithFetch({\n    url: '/react-fetch/mock/data.json',\n    params: {page: 1},\n    updateType: 'nextPage'\n})(({data, send, reload, refresh, loadMore, requestParams}) => {\n    return data.map((item, index) => {\n        return <div key={index}>{item.title}</div>\n    });\n});\n\nReactDOM.render(<Remote/>, document.getElementById('eui-example-runner'));\n\n"
        },
        {
            "title": "基本用法",
            "description": "注意：react-fetch 内部处理请求的时候只通过 code,msg,results来作为内部逻辑，code为200判定为请求成功，不为200时判定为错误，msg会传入到error组件，拿到results后，会将results作为业务组件的data属性\n如果后端的返回不满足上诉格式，需要在preset的transformResponse方法做转换适配\najax为一个axios实例，每个实例的拦截器可能不同，默认会在内部自动创建一个axios实例，但是没有任何拦截器，如果想给其添加拦截器，可以自行创建axios实例通过preset设置\npreset 可以单独放一个文件里，在入口文件顶部引入",
            "isFull": false,
            "scope": [
                {
                    "name": "ReactFetch",
                    "packageName": "@kne/react-fetch",
                    "component":ReactFetch
                }
            ],
            "code": "const {createWithFetch, preset} = ReactFetch;\n\npreset({\n    ajax: (config) => {\n        console.log(config);\n        return new Promise((resolve) => {\n            setTimeout(() => {\n                resolve({\n                    data: {\n                        code: 0,\n                        data: [\n                            {title: '数据一'},\n                            {title: '数据二'}\n                        ]\n                    }\n                });\n            }, 1000);\n        });\n    },\n    loading: 'loading....',\n    empty: '空',\n    transformResponse: (response) => {\n        const {data} = response;\n        response.data = {\n            code: data.code === 0 ? 200 : data.code, msg: data.msg, results: data.data\n        };\n        return response;\n    }\n});\n\nconst Remote = createWithFetch({\n    url: '/react-fetch/mock/data.json',\n    params: {page: 1},\n    updateType: 'nextPage'\n})(({data, send, reload, refresh, loadMore, requestParams}) => {\n    return data.map((item, index) => {\n        return <div key={index}>{item.title}</div>\n    });\n});\n\nReactDOM.render(<Remote/>, document.getElementById('eui-example-runner'));\n\n"
        }
    ]}/>
};

export default App;
