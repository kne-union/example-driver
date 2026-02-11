### ExampleDriver
用于展示和编辑 React 组件示例的主组件，支持 LiveCode 和 MiniCode 两种展示模式。

#### 属性说明
| 属性名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| list | array | 是 | - | 示例列表数组，每个元素代表一个示例 |
| isFull | boolean | 否 | false | 是否全宽显示，true 时单列显示，false 时双列显示 |
| contextComponent | React Component | 否 | - | 自定义上下文组件，用于包裹渲染的代码内容 |
| className | string | 否 | - | 自定义 CSS 类名 |
| ...props | object | 否 | - | 其他 HTML div 元素的属性 |

#### list 数组项属性说明
| 属性名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| code | string | 是 | - | 示例代码字符串 |
| scope | array | 是 | - | 作用域数组，包含组件和包信息 |
| title | string | 是 | - | 示例标题 |
| description | string | 是 | - | 示例描述，支持 HTML 格式 |
| qrcodeUrl | string | 否 | - | 二维码图片 URL，传入此项则使用 MiniCode 模式 |
| contextComponent | React Component | 否 | - | 单个示例的自定义上下文组件 |

#### scope 数组项属性说明
| 属性名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| component | React Component | 是 | - | 要暴露给示例代码的组件 |
| name | string | 是 | - | 组件名称，在代码中使用 |
| packageName | string | 否 | - | 包名，用于生成导入语句 |
| importStatement | string | 否 | - | 自定义导入语句，覆盖自动生成的导入 |

### LiveCode
提供实时代码编辑和预览功能的子组件（通过 ExampleDriver 自动使用）。

#### 属性说明
| 属性名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| code | string | 是 | - | 要展示的代码 |
| scope | array | 是 | - | 作用域数组 |
| title | string | 是 | - | 标题 |
| description | string | 是 | - | 描述 |
| contextComponent | React Component | 否 | - | 上下文组件 |

### MiniCode
显示二维码预览的只读模式子组件（通过 ExampleDriver 自动使用）。

#### 属性说明
| 属性名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| code | string | 是 | - | 示例代码 |
| qrcodeUrl | string | 是 | - | 二维码图片地址 |
| scope | array | 是 | - | 作用域数组 |
| title | string | 是 | - | 标题 |
| description | string | 是 | - | 描述 |

### config
Monaco Editor 的配置对象，用于自定义编辑器行为。

#### 方法说明
| 方法名 | 参数 | 返回值 | 说明 |
|--------|------|--------|------|
| config | options: object | void | 配置 Monaco Editor 的加载选项，如模块路径等 |
