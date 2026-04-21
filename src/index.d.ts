import { ReactNode, ComponentType, CSSProperties, HTMLAttributes } from 'react';

/**
 * Scope项定义，用于向示例代码中注入组件和模块
 */
export interface ScopeItem {
  /**
   * 组件对象或值
   */
  component?: any;

  /**
   * 在示例代码中使用的变量名
   */
  name?: string;

  /**
   * 包名或模块名，用于生成导入语句
   */
  packageName?: string;

  /**
   * 自定义导入语句，如果提供则不自动生成
   */
  importStatement?: string;
}

/**
 * LiveCode组件的属性
 */
export interface LiveCodeProps {
  /**
   * 示例代码字符串
   */
  code: string;

  /**
   * 作用域数组，包含注入到示例代码中的组件和模块
   */
  scope: ScopeItem[];

  /**
   * 示例标题
   */
  title: string;

  /**
   * 示例描述，支持HTML格式
   */
  description: string;

  /**
   * 自定义上下文组件，用于包裹渲染的示例内容
   */
  contextComponent?: ComponentType<{ children?: ReactNode }>;

  /**
   * 控制示例是否挂载：
   * - 传入时：由该值决定挂载/卸载
   * - 不传：由是否进入视口决定挂载/卸载
   */
  mounted?: boolean;

  /**
   * 是否启用“进入视口才挂载”的检测（仅 mounted 未传入时生效）
   * 默认：true
   */
  useInView?: boolean;
}

/**
 * MiniCode组件的属性
 */
export interface MiniCodeProps {
  /**
   * 示例代码字符串
   */
  code: string;

  /**
   * 二维码图片URL，用于移动端预览
   */
  qrcodeUrl: string;

  /**
   * 作用域数组，包含注入到示例代码中的组件和模块
   */
  scope: ScopeItem[];

  /**
   * 示例标题
   */
  title: string;

  /**
   * 示例描述，支持HTML格式
   */
  description: string;
}

/**
 * 示例项属性，可以是LiveCode或MiniCode
 */
export interface ExampleItem {
  /**
   * 示例标题
   */
  title: string;

  /**
   * 示例描述，支持HTML格式
   */
  description: string;

  /**
   * 示例代码
   */
  code: string;

  /**
   * 作用域数组
   */
  scope: ScopeItem[];

  /**
   * 二维码图片URL，如果提供则使用MiniCode模式
   */
  qrcodeUrl?: string;

  /**
   * 控制示例是否挂载（仅LiveCode生效）
   */
  mounted?: boolean;

  /**
   * 是否启用“进入视口才挂载”的检测（仅 mounted 未传入时生效）
   * 默认：true
   */
  useInView?: boolean;

  /**
   * 自定义上下文组件
   */
  contextComponent?: ComponentType<{ children?: ReactNode }>;
}

/**
 * DriverItem组件的属性（内部使用）
 */
export interface DriverItemProps {
  /**
   * 是否全宽显示
   */
  isFull?: boolean;

  /**
   * 自定义上下文组件
   */
  contextComponent?: ComponentType<{ children?: ReactNode }>;

  /**
   * 示例列表
   */
  list: ExampleItem[];
}

/**
 * Monaco编辑器配置选项
 */
export interface MonacoConfigOptions {
  /**
   * 模块路径配置
   */
  paths?: Record<string, string>;

  /**
   * 其他配置选项
   */
  [key: string]: any;
}

/**
 * Monaco编辑器配置函数
 */
export interface MonacoConfig {
  /**
   * 配置Monaco编辑器
   * @param options 配置选项
   */
  (options: MonacoConfigOptions): void;
}

/**
 * ExampleDriver组件的属性
 */
export interface ExampleDriverProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * 示例列表数组
   */
  list: ExampleItem[];

  /**
   * 是否全宽显示，true时单列显示，false时双列显示
   * 默认：false
   */
  isFull?: boolean;

  /**
   * 自定义上下文组件，用于包裹所有示例的渲染内容
   */
  contextComponent?: ComponentType<{ children?: ReactNode }>;

  /**
   * 自定义CSS类名
   */
  className?: string;

  /**
   * 其他HTML div元素属性
   */
  [key: string]: any;
}

/**
 * LiveCode组件声明
 */
export declare const LiveCode: ComponentType<LiveCodeProps>;

/**
 * MiniCode组件声明
 */
export declare const MiniCode: ComponentType<MiniCodeProps>;

/**
 * DriverItem组件声明
 */
export declare const DriverItem: ComponentType<DriverItemProps>;

/**
 * ExampleDriver主组件
 * 用于展示和编辑React组件示例
 */
export declare const ExampleDriver: ComponentType<ExampleDriverProps>;

/**
 * Monaco编辑器配置对象
 */
export declare const config: MonacoConfig;
