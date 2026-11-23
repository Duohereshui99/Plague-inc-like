# 终末菌株

一款原创的网页策略小游戏。你扮演一株刚出现的未知菌株，在真实世界地图上选一个国家放出零号感染者，用变异点进化传播途径、症状和能力，赶在人类研发出疫苗之前感染全世界 238 个国家和地区。

画面是墨绿雷达监测屏风格：扫描线扫过地图时，被感染的国家会亮起回波。

## 怎么玩

直接用浏览器打开 `index.html` 即可，不需要安装任何东西。

1. 开局给菌株起名，选难度（休闲 / 标准 / 困难）。
2. 在地图上点一个国家，放出零号感染者。
3. 传播和死亡会带来变异点，用来进化：
   - **传播**：气溶胶、水源、蚊媒、禽畜
   - **症状**：从咳嗽到系统崩溃，越往后越致命，也越容易被察觉
   - **能力**：耐寒、耐热、抗药、基因伪装、基因重组
4. 症状越重越早被人类发现。各国会关闭机场、港口和边境，疫苗研发也会加快。
5. 所有人类消失就赢；疫苗研发到 100% 或菌株灭绝就输。

**操作**：滚轮或双指缩放地图，拖动平移；顶部按钮或键盘 `1` `2` `3` 调速，空格暂停。

**技巧**：先悄悄扩散，等「已波及」接近 238 再进化致命症状。致死率拉得太早，宿主会死得比传播还快。

## 目录

| 路径 | 说明 |
| --- | --- |
| `index.html` | 游戏本体，单个文件，地图数据已内嵌 |
| `src/game.src.html` | 游戏源码（界面、模拟逻辑），`__WORLD__` 处由构建脚本填入地图数据 |
| `src/world.json` | 已生成的地图数据：国家形状、人口、收入水平、气候、陆上邻国、是否沿海 |
| `src/build.mjs` | 从 Natural Earth 地图数据生成 `world.json` |
| `src/assemble.js` | 把 `world.json` 填进源码，生成根目录的 `index.html` |
| `src/sim.js` | 无界面批量模拟，用来检查难度平衡 |

## 修改与构建

需要 Node.js 18 或更高版本。改完 `src/game.src.html` 后重新生成 `index.html`：

```bash
cd src
npm run build
```

批量模拟各难度的胜负和天数：

```bash
npm run sim
```

想重新生成地图数据，先下载 [Natural Earth 1:50m 国家边界](https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_50m_admin_0_countries.geojson)，存为 `src/ne_50m_admin_0_countries.geojson`，然后：

```bash
npm install
npm run build:map
npm run build
```

## 数据来源

国家边界、人口和收入分组来自 [Natural Earth](https://www.naturalearthdata.com/)（公有领域）。游戏中的数值为简化模型，不代表真实疫情。

本项目是独立制作的原创游戏，与任何商业游戏及其开发商无关。
