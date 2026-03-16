(function(){
  "use strict";
  var path=window.location.pathname||"";
  var m=path.match(/\/tools\/([^\/]+)\.html$/);
  if(!m)return;
  var currentFile=m[1];

  fetch("/tools-list.json").then(function(r){return r.json()}).then(function(tools){
    var current=null;
    var byCat={};
    tools.forEach(function(t){
      var cat=t.category||"Other";
      if(!byCat[cat])byCat[cat]=[];
      byCat[cat].push(t);
      if(t.file===currentFile)current=t;
    });
    if(!current)return;

    var cat=current.category||"Other";
    var related=(byCat[cat]||[]).filter(function(t){return t.file!==currentFile}).slice(0,5);

    var main=document.querySelector("main.container");
    if(!main)return;

    var backLink=main.querySelector('a[href="/"]');
    var catSlug="cat-"+cat.toLowerCase().replace(/\s+/g,"-").replace(/[^a-z0-9-]/g,"");
    var breadcrumb=document.createElement("nav");
    breadcrumb.className="tool-breadcrumb";
    breadcrumb.setAttribute("aria-label","Breadcrumb");
    breadcrumb.innerHTML='<a href="/">Home</a> &gt; <a href="/#'+catSlug+'">'+escapeHtml(cat)+"</a> &gt; <span>"+escapeHtml(current.name)+"</span>";
    if(backLink){
      var p=backLink.closest("p");
      if(p)p.parentNode.replaceChild(breadcrumb,p);
      else main.insertBefore(breadcrumb,main.firstChild);
    }else{
      main.insertBefore(breadcrumb,main.firstChild);
    }

    var seo=main.querySelector("section.tool-seo");
    if(seo&&related.length>0){
      var relSec=document.createElement("section");
      relSec.className="tool-related";
      relSec.innerHTML="<h3>Related Tools</h3><ul></ul>";
      var ul=relSec.querySelector("ul");
      related.forEach(function(t){
        var li=document.createElement("li");
        var a=document.createElement("a");
        a.href="/tools/"+t.file+".html";
        a.textContent=t.name;
        li.appendChild(a);
        ul.appendChild(li);
      });
      main.appendChild(relSec);
    }

    var descMeta=document.querySelector('meta[name="description"]');
    var desc=descMeta?descMeta.getAttribute("content"):current.name+" - Free online tool.";
    var schema={
      "@context":"https://schema.org",
      "@type":"WebApplication",
      "name":current.name,
      "description":desc,
      "applicationCategory":"DeveloperApplication",
      "url":window.location.href,
      "offers":{"@type":"Offer","price":"0","priceCurrency":"USD"}
    };
    var breadcrumbSchema={
      "@context":"https://schema.org",
      "@type":"BreadcrumbList",
      "itemListElement":[
        {"@type":"ListItem","position":1,"name":"Home","item":window.location.origin+"/"},
        {"@type":"ListItem","position":2,"name":cat},
        {"@type":"ListItem","position":3,"name":current.name,"item":window.location.href}
      ]
    };
    function addSchema(obj){
      var s=document.createElement("script");
      s.type="application/ld+json";
      s.textContent=JSON.stringify(obj);
      document.head.appendChild(s);
    }
    addSchema(schema);
    addSchema(breadcrumbSchema);
  });

  function escapeHtml(s){
    var d=document.createElement("div");
    d.textContent=s;
    return d.innerHTML;
  }
})();
