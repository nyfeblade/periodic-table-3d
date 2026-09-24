import json, io

with open("index_template.html", encoding="utf-8") as f:
    html = f.read()

with open("three.min.js", encoding="utf-8") as f:
    three_js = f.read()

with open("OrbitControls.js", encoding="utf-8") as f:
    orbit_js = f.read()

with open("style.css", encoding="utf-8") as f:
    css = f.read()

with open("app.js", encoding="utf-8") as f:
    app_js = f.read()

with open("elements.json", encoding="utf-8") as f:
    elements_json = f.read()
    # sanity check it's valid JSON
    json.loads(elements_json)

scripts_block = (
    "<script>\n/* Three.js r128 (bundled for offline use) */\n" + three_js + "\n</script>\n"
    "<script>\n/* THREE.OrbitControls (bundled for offline use) */\n" + orbit_js + "\n</script>\n"
)

html = html.replace("/*__CSS__*/", css)
html = html.replace("<!--__SCRIPTS__-->", scripts_block)
html = html.replace("/*__ELEMENTS_JSON__*/[]/*__END_ELEMENTS_JSON__*/", elements_json)
html = html.replace("/*__APP_JS__*/", app_js)

with open("index.html", "w", encoding="utf-8") as f:
    f.write(html)

print("wrote index.html:", len(html), "bytes")
