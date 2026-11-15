import { pointFor, rotationMatrix, rotate, arcBetween } from './globe-math.mjs';

// A small WebGL globe using the browser's own graphics API. No bundled engine.
export function createGlobe(root) {
  const canvas = root.querySelector('canvas');
  const picker = root.querySelector('select');
  const status = root.querySelector('.globe-status');
  const places = [...picker.options].filter((o) => o.value !== '').map((o) => ({ name: o.text, lat: Number(o.dataset.lat), lon: Number(o.dataset.lon) }));
  const gl = canvas.getContext('webgl', { alpha: false, antialias: true });
  if (!gl) {
    root.classList.add('globe-fallback');
    status.textContent = '3D graphics are unavailable. All destinations remain in the list.';
    picker.addEventListener('change', () => { status.textContent = picker.selectedOptions[0].text; });
    return;
  }
  let yaw = 0, pitch = 0, zoom = 1, width = 1, height = 1, frame = 0, visible = false;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const vertex = `attribute vec3 a_position; uniform mat3 u_rotation; uniform vec2 u_scale;
    void main(){vec3 p=u_rotation*a_position;gl_Position=vec4(p.xy*u_scale,-p.z*0.4,1.0);}`;
  function program(vs, fs) {
    const shaders = [[gl.VERTEX_SHADER, vs], [gl.FRAGMENT_SHADER, fs]].map(([type, source]) => {
      const shader = gl.createShader(type); gl.shaderSource(shader, source); gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader));
      return shader;
    });
    const p = gl.createProgram(); shaders.forEach((s) => gl.attachShader(p, s)); gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
    shaders.forEach((s) => gl.deleteShader(s));
    return p;
  }
  const earth = program(
    vertex.replace('void main()', 'attribute vec2 a_uv; varying vec2 v_uv; varying vec3 v_normal; void main()').replace('gl_Position=', 'v_uv=a_uv;v_normal=p;gl_Position='),
    `precision mediump float; varying vec2 v_uv; varying vec3 v_normal; uniform sampler2D u_texture;
     void main(){float light=0.48+0.52*max(dot(normalize(v_normal),normalize(vec3(-0.4,0.6,1.0))),0.0);
     gl_FragColor=vec4(texture2D(u_texture,v_uv).rgb*light,1.0);}`,
  );
  const dots = program(vertex.replace('void main()', 'uniform float u_size; void main()').replace('gl_Position=', 'gl_PointSize=u_size;gl_Position='),
    `precision mediump float; void main(){if(distance(gl_PointCoord,vec2(0.5))>0.5)discard;gl_FragColor=vec4(1.0,0.65,0.0,1.0);}`);
  const lines = program(vertex.replace('void main()', 'attribute float a_path; varying float v_path; void main()').replace('gl_Position=', 'v_path=a_path;gl_Position='),
    `precision mediump float; varying float v_path; uniform float u_time;
     void main(){if(fract(v_path-u_time*0.2)>0.55)discard;gl_FragColor=vec4(1.0,1.0,1.0,0.8);}`);
  function buffer(values, type = gl.ARRAY_BUFFER) {
    const b = gl.createBuffer(); gl.bindBuffer(type, b); gl.bufferData(type, values, gl.STATIC_DRAW); return b;
  }
  const vertices = [], indices = [], rows = 48, columns = 96;
  for (let row = 0; row <= rows; row++) {
    for (let column = 0; column <= columns; column++) vertices.push(...pointFor(90 - row / rows * 180, column / columns * 360 - 180), column / columns, row / rows);
  }
  for (let row = 0; row < rows; row++) {
    for (let column = 0; column < columns; column++) {
      const n = row * (columns + 1) + column;
      indices.push(n, n + 1, n + columns + 1, n + 1, n + columns + 2, n + columns + 1);
    }
  }
  const sphere = buffer(new Float32Array(vertices)), triangles = buffer(new Uint16Array(indices), gl.ELEMENT_ARRAY_BUFFER);
  const points = buffer(new Float32Array(places.flatMap((p) => pointFor(p.lat, p.lon, 1.01))));
  const arcVertices = [];
  let seed = 417;
  const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  for (let i = 0; i < Math.min(12, places.length); i++) {
    const a = pointFor((random() - 0.5) * 180, (random() - 0.5) * 360);
    const b = pointFor((random() - 0.5) * 180, (random() - 0.5) * 360);
    arcBetween(a, b).forEach((p, j, array) => {
      if (j) arcVertices.push(...array[j - 1], (j - 1) / 64 + i * 0.13, ...p, j / 64 + i * 0.13);
    });
  }
  const arcs = buffer(new Float32Array(arcVertices));
  const labels = places.map((place) => {
    const label = document.createElement('span'); label.textContent = place.name;
    root.querySelector('.globe-labels').append(label); return label;
  });
  const texture = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([10, 35, 65, 255]));
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  const image = new Image(); image.src = '/assets/globe.jpg';
  image.onload = () => { gl.bindTexture(gl.TEXTURE_2D, texture); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image); draw(performance.now()); };
  function use(p, data, stride, time) {
    gl.useProgram(p); gl.bindBuffer(gl.ARRAY_BUFFER, data);
    const attribute = gl.getAttribLocation(p, 'a_position'); gl.enableVertexAttribArray(attribute); gl.vertexAttribPointer(attribute, 3, gl.FLOAT, false, stride, 0);
    gl.uniformMatrix3fv(gl.getUniformLocation(p, 'u_rotation'), false, rotationMatrix(yaw, pitch));
    const radius = Math.min(width * 0.42, height * 0.32) * zoom;
    gl.uniform2f(gl.getUniformLocation(p, 'u_scale'), radius * 2 / width, radius * 2 / height);
    if (p === lines) gl.uniform1f(gl.getUniformLocation(p, 'u_time'), reducedMotion.matches ? 0 : time / 1000);
  }
  function draw(time) {
    gl.viewport(0, 0, canvas.width, canvas.height); gl.clearColor(0, 0, 0.067, 1); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); gl.enable(gl.DEPTH_TEST);
    use(earth, sphere, 20, time);
    const uv = gl.getAttribLocation(earth, 'a_uv'); gl.enableVertexAttribArray(uv); gl.vertexAttribPointer(uv, 2, gl.FLOAT, false, 20, 12);
    gl.bindTexture(gl.TEXTURE_2D, texture); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangles); gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0); gl.disableVertexAttribArray(uv);
    use(lines, arcs, 16, time); const path = gl.getAttribLocation(lines, 'a_path'); gl.enableVertexAttribArray(path); gl.vertexAttribPointer(path, 1, gl.FLOAT, false, 16, 12);
    gl.drawArrays(gl.LINES, 0, arcVertices.length / 4); gl.disableVertexAttribArray(path);
    use(dots, points, 12, time); gl.uniform1f(gl.getUniformLocation(dots, 'u_size'), 6 * Math.min(devicePixelRatio, 2)); gl.drawArrays(gl.POINTS, 0, places.length);
    const matrix = rotationMatrix(yaw, pitch), radius = Math.min(width * 0.42, height * 0.32) * zoom;
    places.forEach((place, i) => {
      const [x, y, z] = rotate(pointFor(place.lat, place.lon), matrix), label = labels[i];
      label.hidden = z < 0.15; label.style.left = `${width / 2 + x * radius}px`; label.style.top = `${height / 2 - y * radius + 7}px`; label.style.fontSize = `${3 + 4 * z}px`;
    });
    root.dataset.rotation = `${yaw.toFixed(3)},${pitch.toFixed(3)}`;
    root.dataset.ready = 'true';
  }
  function animate(time) { frame = 0; draw(time); if (visible && !document.hidden && !reducedMotion.matches) frame = requestAnimationFrame(animate); }
  function start() { if (!frame) frame = requestAnimationFrame(animate); }
  function resize() {
    width = root.clientWidth; height = root.clientHeight; const dpr = Math.min(devicePixelRatio, 2);
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr); draw(performance.now());
  }
  if ('ResizeObserver' in window) new ResizeObserver(resize).observe(root);
  else window.addEventListener('resize', resize, { passive: true });
  if ('IntersectionObserver' in window) new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) start(); else { cancelAnimationFrame(frame); frame = 0; } }).observe(root);
  else visible = true;
  document.addEventListener('visibilitychange', start); reducedMotion.addEventListener('change', start);
  let drag, pinch;
  const pointers = new Map();
  const distance = () => { const [a, b] = [...pointers.values()]; return Math.hypot(a[0] - b[0], a[1] - b[1]); };
  canvas.addEventListener('pointerdown', (event) => {
    pointers.set(event.pointerId, [event.clientX, event.clientY]);
    if (pointers.size === 1) drag = [event.clientX, event.clientY];
    if (pointers.size === 2) pinch = distance();
    canvas.setPointerCapture(event.pointerId); canvas.focus({ preventScroll: true });
  });
  canvas.addEventListener('pointermove', (event) => {
    if (!pointers.has(event.pointerId)) return;
    pointers.set(event.pointerId, [event.clientX, event.clientY]);
    if (pointers.size === 2) {
      const next = distance(); if (pinch > 0) zoom = Math.max(0.7, Math.min(1.4, zoom * next / pinch));
      pinch = next; start(); return;
    }
    if (!drag) return; yaw += (event.clientX - drag[0]) * 0.008; pitch = Math.max(-1.4, Math.min(1.4, pitch + (event.clientY - drag[1]) * 0.008)); drag = [event.clientX, event.clientY]; start();
  });
  const release = (event) => { pointers.delete(event.pointerId); drag = pointers.size === 1 ? [...pointers.values()][0] : undefined; pinch = undefined; };
  canvas.addEventListener('pointerup', release); canvas.addEventListener('pointercancel', release);
  canvas.addEventListener('wheel', (event) => {
    if (document.activeElement !== canvas) return;
    event.preventDefault(); zoom = Math.max(0.7, Math.min(1.4, zoom - event.deltaY * 0.001)); start();
  }, { passive: false });
  canvas.addEventListener('keydown', (event) => {
    const keys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', '+', '=', '-']; if (!keys.includes(event.key)) return;
    event.preventDefault();
    if (event.key === 'ArrowLeft') yaw -= 0.15; if (event.key === 'ArrowRight') yaw += 0.15;
    if (event.key === 'ArrowUp') pitch -= 0.15; if (event.key === 'ArrowDown') pitch += 0.15;
    if (event.key === '+' || event.key === '=') zoom = Math.min(1.4, zoom + 0.1); if (event.key === '-') zoom = Math.max(0.7, zoom - 0.1);
    pitch = Math.max(-1.4, Math.min(1.4, pitch)); start();
  });
  picker.addEventListener('change', () => {
    if (picker.value === '') return; const place = places[Number(picker.value)]; yaw = -place.lon * Math.PI / 180; pitch = place.lat * Math.PI / 180;
    status.textContent = place.name; start();
  });
  canvas.addEventListener('webglcontextlost', (event) => { event.preventDefault(); cancelAnimationFrame(frame); root.classList.add('globe-fallback'); });
  resize(); start();
}
