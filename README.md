# docker-panel-reborn

Docker control panel
!WARNING! You must create file named "database.js" with content like 
<code>module.exports = {
  'secret':'<any random string (for JWT signing)>',
  'database': '<your mongo connection>'
};</code>
in "config" folder!
