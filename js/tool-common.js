(function(){
  "use strict";
  var path=window.location.pathname||"";
  var m=path.match(/\/tools\/([^\/]+)\.html$/);
  var isToolPage=!!m;
  var currentFile=m?m[1]:null;

  var KEY_NAV=["JSON & Data","Encoding & Decoding","Text","PDF & Export","Date & Time","Security & Tokens","Code & Formatting"];
  var CAT_ORDER=["JSON & Data","Encoding & Decoding","Text","Images & Colors","PDF & Export","Date & Time","Time & Planning","Daily Productivity","Money & Decisions","Generators & Converters","Calculators","Security & Tokens","Web & Network","API & Data","Code & Formatting","Debug & Testing","Database","Schedules & Infra","SEO & Webmaster"];

  function sortTools(tools){
    return tools.slice().sort(function(a,b){
      var pa=typeof a.popularOrder==="number"?a.popularOrder:999;
      var pb=typeof b.popularOrder==="number"?b.popularOrder:999;
      if(pa!==pb)return pa-pb;
      return (a.name||"").localeCompare(b.name||"");
    });
  }

  function injectTopNav(tools){
    var byCat={};
    tools.forEach(function(t){
      var c=t.category||"Other";
      if(!byCat[c])byCat[c]=[];
      byCat[c].push(t);
    });
    var header=document.querySelector(".top-nav");
    if(!header){
      header=document.createElement("header");
      header.className="top-nav";
      header.innerHTML='<a href="/" class="top-nav-brand">ToolForge</a><nav id="tool-top-nav-menu" class="top-nav-menu" aria-label="Tool categories"></nav>';
      document.body.insertBefore(header,document.body.firstChild);
    }
    var menu=document.getElementById("tool-top-nav-menu")||header.querySelector(".top-nav-menu");
    if(!menu||menu.children.length>0)return;
    var otherCats=CAT_ORDER.concat(Object.keys(byCat).filter(function(c){return CAT_ORDER.indexOf(c)===-1})).filter(function(c){return KEY_NAV.indexOf(c)===-1&&byCat[c]&&byCat[c].length>0});
    KEY_NAV.forEach(function(cat){
      var list=byCat[cat];
      if(!list||!list.length)return;
      var item=document.createElement("div");
      item.className="top-nav-item";
      var btn=document.createElement("button");
      btn.className="top-nav-trigger";
      btn.type="button";
      btn.textContent=cat+" ▾";
      var drop=document.createElement("div");
      drop.className="top-nav-dropdown";
      sortTools(list).forEach(function(t){
        var a=document.createElement("a");
        a.href="/tools/"+t.file+".html";
        a.textContent=t.name;
        drop.appendChild(a);
      });
      item.appendChild(btn);
      item.appendChild(drop);
      menu.appendChild(item);
    });
    if(otherCats.length>0){
      var item=document.createElement("div");
      item.className="top-nav-item";
      var btn=document.createElement("button");
      btn.className="top-nav-trigger";
      btn.type="button";
      btn.textContent="Other ▾";
      var drop=document.createElement("div");
      drop.className="top-nav-dropdown top-nav-dropdown-other";
      otherCats.forEach(function(cat){
        var list=byCat[cat];
        if(!list||!list.length)return;
        var g=document.createElement("div");
        g.className="top-nav-dropdown-group";
        g.innerHTML="<div class=\"top-nav-dropdown-group-title\">"+escapeHtml(cat)+"</div>";
        sortTools(list).forEach(function(t){
          var a=document.createElement("a");
          a.href="/tools/"+t.file+".html";
          a.textContent=t.name;
          g.appendChild(a);
        });
        drop.appendChild(g);
      });
      item.appendChild(btn);
      item.appendChild(drop);
      menu.appendChild(item);
    }
  }

  fetch("/tools-list.json").then(function(r){return r.json()}).then(function(tools){
    injectTopNav(tools);
    if(!isToolPage)return;
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
    var catSlug=cat.toLowerCase().replace(/\s+/g,"-").replace(/[^a-z0-9-]/g,"");
    var breadcrumb=document.createElement("nav");
    breadcrumb.className="tool-breadcrumb";
    breadcrumb.setAttribute("aria-label","Breadcrumb");
    breadcrumb.innerHTML='<a href="/">Home</a> &gt; <a href="/category/'+catSlug+'.html">'+escapeHtml(cat)+"</a> &gt; <span>"+escapeHtml(current.name)+"</span>";
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
        {"@type":"ListItem","position":2,"name":cat,"item":window.location.origin+"/category/"+catSlug+".html"},
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
