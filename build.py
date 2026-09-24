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

with open("isotopes.json", encoding="utf-8") as f:
    isotopes_json = f.read()
    json.loads(isotopes_json)

with open("decay_chains.json", encoding="utf-8") as f:
    decay_chains_json = f.read()
    json.loads(decay_chains_json)

with open("chem_reactions.json", encoding="utf-8") as f:
    chem_reactions_json = f.read()
    json.loads(chem_reactions_json)

with open("nuclear_presets.json", encoding="utf-8") as f:
    nuclear_presets_json = f.read()
    json.loads(nuclear_presets_json)

scripts_block = (
    "<script>\n/* Three.js r128 (bundled for offline use) */\n" + three_js + "\n</script>\n"
    "<script>\n/* THREE.OrbitControls (bundled for offline use) */\n" + orbit_js + "\n</script>\n"
)

html = html.replace("/*__CSS__*/", css)
html = html.replace("<!--__SCRIPTS__-->", scripts_block)
html = html.replace("/*__ELEMENTS_JSON__*/[]/*__END_ELEMENTS_JSON__*/", elements_json)
def minify(s):
    out = json.dumps(json.loads(s), ensure_ascii=False, separators=(",", ":"))
    assert "</" not in out
    return out

html = html.replace("/*__ISOTOPES_JSON__*/", minify(isotopes_json))
html = html.replace("/*__DECAY_CHAINS_JSON__*/", minify(decay_chains_json))
html = html.replace("/*__CHEM_REACTIONS_JSON__*/", minify(chem_reactions_json))
html = html.replace("/*__NUCLEAR_PRESETS_JSON__*/", minify(nuclear_presets_json))
html = html.replace("/*__APP_JS__*/", app_js)

with open("index.html", "w", encoding="utf-8") as f:
    f.write(html)

print("wrote index.html:", len(html), "bytes")
