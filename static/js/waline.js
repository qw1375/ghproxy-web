/**
 *
 * Waline 评论系统初始化
 *
 */
document.addEventListener('DOMContentLoaded', async function() {
    const { init } = await import('https://unpkg.com/@waline/client@v3/dist/waline.js');

    const path = `${window.location.href}`;

    const waline = init({
        el: "#waline",
        // serverURL: "https://waline.akams.cn",
        serverURL: "https://waline-akams.tbedu.top",
        path: "/github", // 当前文章页路径，用于区分不同的文章页
        dark: 'html[data-theme="dark"]',
        // meta: ["nick"], // 评论者相关属性。
        // requiredMeta: ['nick', 'mail'], // 设置必填项
        // login: "disable", // 禁用登录，用户只能填写信息评论
        pageSize: 10, // 评论列表分页，每页条数
        copyright: true, // 是否显示页脚版权信息：本站评论功能使用 waline 实现！
        reaction: [
            // 为文章增加表情互动功能，设置为 true 提供默认表情，也可以通过设置表情地址数组来自定义表情图片，最大支持 8 个表情。
            "https://npm.elemecdn.com/@waline/emojis@1.1.0/bilibili/bb_heart_eyes.png",
            "https://npm.elemecdn.com/@waline/emojis@1.1.0/bilibili/bb_thumbsup.png",
            "https://npm.elemecdn.com/@waline/emojis@1.1.0/bilibili/bb_zhoumei.png",
            "https://npm.elemecdn.com/@waline/emojis@1.1.0/bilibili/bb_grievance.png",
            "https://npm.elemecdn.com/@waline/emojis@1.1.0/bilibili/bb_dizzy_face.png",
            "https://npm.elemecdn.com/@waline/emojis@1.1.0/bilibili/bb_slap.png",
        ],
        locale: {
            placeholder: "请留言。(填写邮箱可在被回复时收到邮件提醒)",
            reaction0: "非常有用",
            reaction1: "有帮助",
            reaction2: "一般",
            reaction3: "无帮助",
            reaction4: "看不懂",
            reaction5: "有错误",
            reactionTitle: "本站内容对你有帮助吗？",
            sofa: "还没有人留言哦！快来抢沙发吧~",
            comment: "留言",
        },
        emoji: [
            'https://fastly.jsdelivr.net/gh/norevi/waline-blobcatemojis@1.0/blobs',
            "https://unpkg.com/@waline/emojis@1.2.0/bmoji",
            "https://unpkg.com/@waline/emojis@1.2.0/bilibili",
            "https://unpkg.com/@waline/emojis@1.2.0/weibo",
            'https://unpkg.com/@waline/emojis@1.2.0/qq',
            'https://unpkg.com/@waline/emojis@1.2.0/tieba',
            'https://unpkg.com/@waline/emojis@1.2.0/alus'
        ],
        imageUploader: false, // 自定义图片上传方法。默认行为是将图片 Base 64 编码嵌入，你可以设置为 false 以禁用图片上传功能。
        search: false, // 禁用gif表情包搜索
        // wordLimit: 1024, // 评论字数限制。填入单个数字时为最大字数限制。设置为 0 时无限制。
        // comment: true, // 文章评论数统计，填入字符串时会作为 CSS 选择器。
        // pageview: true, // 文章浏览量统计，填入字符串时会作为 CSS 选择器。
    });
});
