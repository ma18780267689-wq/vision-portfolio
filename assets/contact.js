export const contact={resumeHref:"/vision-portfolio/assets/content/resume-cv.pdf"};
export function openContact(trigger) {
  window.dispatchEvent(new CustomEvent('portfolio:open-wechat-modal',{detail:{trigger}}));
}
export function ContactDetails({react:React}) {
  const h=React.createElement;
  return h('div',{className:'contact-dialog-content'}, h('div',{className:'contact-dialog-copy'},
    h('h3',{id:'wechat-modal-title'},'联系马志成'),
    h('p',{id:'wechat-modal-description'},'邮箱和微信二维码见原个人网站。'),
    h('a',{className:'contact-button is-primary',href:"https://zhicheng-ma-portfolio-demo.rainy-robin-0983.chatgpt.site/#contact",target:'_blank',rel:'noopener noreferrer'},'查看邮箱与微信 ↗')));
}
