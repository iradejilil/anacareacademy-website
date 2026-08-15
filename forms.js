(function(){
  function validEmail(v){ return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v); }

  function showErr(el,on){
    el.setAttribute('aria-invalid', on ? 'true' : 'false');
    var field = el.closest('.ffield');
    if(!field) return;
    var err = field.querySelector('.ferr');
    if(err) err.classList.toggle('show', on);
  }

  function checkGroup(boxId, errId){
    var box = document.getElementById(boxId);
    if(!box) return true;
    var any = box.querySelector('input:checked') !== null;
    var err = document.getElementById(errId);
    if(err) err.classList.toggle('show', !any);
    return any;
  }

  window.acaWireForm = function(formId, successId, groups){
    var form = document.getElementById(formId);
    if(!form) return;
    var success = document.getElementById(successId);
    groups = groups || [];

    form.querySelectorAll('input,select,textarea').forEach(function(el){
      el.addEventListener('blur', function(){
        if(!el.hasAttribute('required')) return;
        showErr(el, !el.value.trim() || (el.type==='email' && !validEmail(el.value.trim())));
      });
      el.addEventListener('input', function(){
        if(el.getAttribute('aria-invalid')==='true') showErr(el,false);
      });
    });

    groups.forEach(function(g){
      var box = document.getElementById(g[0]);
      if(box) box.addEventListener('change', function(){ checkGroup(g[0], g[1]); });
    });

    form.addEventListener('submit', function(e){
      e.preventDefault();
      var ok = true, firstBad = null;

      form.querySelectorAll('[required]').forEach(function(el){
        var bad = !el.value.trim() || (el.type==='email' && !validEmail(el.value.trim()));
        showErr(el, bad);
        if(bad){ ok=false; if(!firstBad) firstBad=el; }
      });

      groups.forEach(function(g){
        if(!checkGroup(g[0],g[1])){ ok=false; if(!firstBad) firstBad=document.getElementById(g[0]); }
      });

      if(!ok){
        if(firstBad){
          firstBad.scrollIntoView({behavior:'smooth',block:'center'});
          if(firstBad.focus) firstBad.focus({preventScroll:true});
        }
        return;
      }

      var btn = form.querySelector('button[type=submit]');
      var label = btn ? btn.textContent : '';

      function done(){
        form.style.display='none';
        if(success){ success.classList.add('show'); success.scrollIntoView({behavior:'smooth',block:'center'}); }
      }

      // Local preview has nowhere to post.
      if(location.protocol === 'file:'){ done(); return; }

      if(btn){ btn.disabled = true; btn.textContent = 'Sending…'; }

      fetch('/', {
        method:'POST',
        headers:{'Content-Type':'application/x-www-form-urlencoded'},
        body:new URLSearchParams(new FormData(form)).toString()
      })
      .then(function(res){ if(!res.ok) throw new Error(res.status); done(); })
      .catch(function(){
        if(btn){ btn.disabled=false; btn.textContent=label; }
        var fine = form.querySelector('.ffine');
        if(fine){
          fine.innerHTML = '<span style="color:#c0392b">Something went wrong sending your form. '+
            'Please try again, or call us at <strong>571-291-1215</strong>.</span>';
        }
      });
    });
  };
})();
