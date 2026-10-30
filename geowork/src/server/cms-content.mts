import sanitizeHtml from 'sanitize-html';

export const slugPattern=/^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export function cleanBody(html:unknown):string {
 if(typeof html!=='string'||html.length>240000)throw new Error('Article body is too long');
 return sanitizeHtml(html,{
  allowedTags:['h2','h3','h4','p','br','b','strong','em','i','a','ul','ol','li','blockquote','hr','pre','code','img','figure','figcaption'],
  allowedAttributes:{a:['href','title','target'],img:['src','alt','loading','width','height']},
  allowedSchemes:['http','https','mailto'],
  allowedSchemesAppliedToAttributes:['href'],
  allowedSchemesByTag:{img:[]},
  allowedStyles:{},
  transformTags:{
    a:(_tag,attrs)=>({tagName:'a',attribs:{href:attrs.href||'#',rel:'noopener noreferrer',target:'_blank'}}),
    img:(_tag,attrs)=>({
      tagName:'img',
      attribs:{src:/^[/]media[/][a-f0-9-]{36}$/.test(attrs.src||'') ? attrs.src : '',alt:(attrs.alt||'').slice(0,180),loading:'lazy'}
    })
  }
 });
}
export type Payload={slug:string;title:string;description:string;category:string;body_html:string;cover_image:string|null;status:'draft'|'published'};
export function validateArticle(raw:unknown):Payload {
 if(!raw||typeof raw!=='object')throw new Error('Missing article');
 const data=raw as Record<string,unknown>;
 const slug=String(data.slug||'').trim().toLowerCase();
 const title=String(data.title||'').trim();
 const description=String(data.description||'').trim();
 const category=String(data.category||'AI Search').trim();
 const status=data.status;
 const cover_image=typeof data.cover_image==='string'&&/^\/media\/[a-f0-9-]{36}$/.test(data.cover_image)?data.cover_image:null;
 if(!slugPattern.test(slug)||slug.length>110)throw new Error('Use a URL slug with lowercase letters, numbers and hyphens.');
 if(title.length<5||title.length>200)throw new Error('Title must be 5–200 characters.');
 if(description.length<30||description.length>400)throw new Error('Description must be 30–400 characters.');
 if(category.length<2||category.length>90)throw new Error('Category must be 2–90 characters.');
 if(status!=='draft'&&status!=='published')throw new Error('Choose draft or published.');
 const body_html=cleanBody(data.body_html);
 if(body_html.replace(/<[^>]*>/g,'').trim().length<80 && status==='published')throw new Error('Add at least 80 characters before publishing.');
 return {slug,title,description,category,status,cover_image,body_html};
}
