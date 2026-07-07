const {default: ExampleDriver} = _ExampleDriver;

const code = `
const { Button, Card, Space } = antd;
const { useState } = React;

const Component = () => {
  const [count, setCount] = useState(0);
  return (
    <div style={{ padding: '12px' }}>
      <Card size="small" title="设备预览示例">
        <Space>
          <Button onClick={() => setCount(count - 1)}>-</Button>
          <span style={{ fontSize: '18px' }}>{count}</span>
          <Button onClick={() => setCount(count + 1)}>+</Button>
        </Space>
      </Card>
    </div>
  );
};

render(<Component />);
`;

const scrollCode = `
const { Card, Tag, Space } = antd;

const Component = () => {
  return (
    <div style={{ padding: '12px' }}>
      <Space orientation="vertical" style={{ width: '100%' }} size="middle">
        <Space wrap>
          <Tag color="blue">纵向超长</Tag>
          <Tag color="green">横向超宽</Tag>
        </Space>
        <div style={{
          minWidth: '800px',
          padding: '16px',
          background: 'linear-gradient(90deg, #e6f4ff, #f6ffed)',
          borderRadius: '8px',
          whiteSpace: 'nowrap',
        }}>
          横向超宽区域（800px）—— 切换到手机预览后左右滑动查看完整内容
        </div>
        {Array.from({ length: 20 }, (_, index) => (
          <Card key={index} size="small" title={'区块 ' + (index + 1)}>
            纵向超长内容，共 20 个区块，用于验证手机框内纵向滚动，以及 header / footer 固定效果。
          </Card>
        ))}
      </Space>
    </div>
  );
};

render(<Component />);
`;

const mediaQueryCode = `
const { Card, Tag, Space } = antd;

const Component = () => {
  return (
    <div style={{ padding: '12px' }}>
      <style>{\`
        .media-demo-box {
          padding: 16px;
          border-radius: 8px;
          background: #e6f4ff;
          color: #0958d9;
        }
        .media-demo-label::after {
          content: '桌面端布局';
        }
        @media (max-width: 768px) {
          .media-demo-box {
            background: #f6ffed;
            color: #389e0d;
          }
          .media-demo-label::after {
            content: '移动端布局';
          }
        }
      \`}</style>
      <Card size="small" title="媒体查询示例">
        <Space orientation="vertical" style={{ width: '100%' }} size="middle">
          <div className="media-demo-box">
            <div className="media-demo-label">当前为</div>
            <div>切换电脑 / 手机预览，观察背景色与文案变化</div>
          </div>
          <Tag color="processing">@media 按 iframe 视口宽度生效</Tag>
        </Space>
      </Card>
    </div>
  );
};

render(<Component />);
`;

const scope = [{name: 'antd', packageName: 'antd', component: antd}];

render(<ExampleDriver list={[
    {
        title: '默认设备切换',
        description: '默认开启电脑 / 手机切换，手机模式下可切换 iPhone Pro Max / Pro / SE',
        code,
        scope
    },
    {
        title: '超长超宽滚动',
        description: '内容同时超出纵向与横向视口，切换到手机模式可验证 SimpleBar 滚动与固定 header / footer',
        code: scrollCode,
        scope
    },
    {
        title: '关闭设备切换',
        description: '设置 devicePreview: false 隐藏设备切换',
        code,
        scope,
        devicePreview: false
    }
]}/>);

render(<ExampleDriver isFull list={[
    {
        title: '媒体查询响应',
        description: '示例内使用 @media (max-width: 768px)，切换到手机预览后应显示移动端布局样式',
        code: mediaQueryCode,
        scope,
        isFull: true
    }
]}/>);
