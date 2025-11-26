const statusEl = document.getElementById("status");
const table = document.getElementById("data-table");
const thead = table.querySelector("thead");
const tbody = table.querySelector("tbody");

const btnComercios = document.getElementById("btn-comercios");
const btnProductos = document.getElementById("btn-productos");
const btnPrecios = document.getElementById("btn-precios");
const formComercio = document.getElementById("form-comercio");
const btnCanasta = document.getElementById("btn-canasta");
const formProductoPrecio = document.getElementById("form-producto-precio");
const selectComercio = document.getElementById("select-comercio");
const selectProducto = document.getElementById("select-producto");

function setStatus(msg, isError = false) {
  if (!statusEl) return;
  statusEl.textContent = msg || "";
  statusEl.classList.toggle("error", !!isError);
}

function renderTable(headers, rows) {
  thead.innerHTML = "";
  tbody.innerHTML = "";

  if (!headers || !headers.length) return;

  const trHead = document.createElement("tr");
  headers.forEach((h) => {
    const th = document.createElement("th");
    th.textContent = h;
    trHead.appendChild(th);
  });
  thead.appendChild(trHead);

  rows.forEach((row) => {
    const tr = document.createElement("tr");
    headers.forEach((h) => {
      const td = document.createElement("td");
      td.textContent = row[h] ?? "";
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
}

async function fetchJSON(path) {
  setStatus("Cargando...");
  try {
    const res = await fetch(path);
    if (!res.ok) {
      throw new Error(`Error ${res.status}`);
    }
    const data = await res.json();
    setStatus("Listo.");
    return data;
  } catch (err) {
    console.error(err);
    setStatus("Ocurrió un error al cargar los datos.", true);
    return null;
  }
}

btnComercios?.addEventListener("click", async () => {
  const data = await fetchJSON("/comercios");
  if (!data) return;

  const rows = data.map((c) => ({
    nombre: c.nombre,
    rubro: c.rubro,
    direccion: c.direccion,
    medios_pago: (c.medios_pago || []).join(", "),
  }));

  renderTable(["nombre", "rubro", "direccion", "medios_pago"], rows);
});

btnProductos?.addEventListener("click", async () => {
  const data = await fetchJSON("/productos");
  if (!data) return;
  console.log("Productos cargados:", data);

  const rows = data.map((p) => ({
    nombre: p.nombre,
    marca: p.marca,
    // Usamos categoriaNombre si existe, para que no muestre el ID feo
    categoria: p.categoriaNombre || p.categoria || "",
    atributos: p.atributos ? JSON.stringify(p.atributos) : "",
  }));

  renderTable(["nombre", "marca", "categoria", "atributos"], rows);
});

btnPrecios?.addEventListener("click", async () => {
  const data = await fetchJSON("/precios");
  if (!data) return;

  const rows = data.map((p) => ({
    comercio: p.comercio?.nombre || p.comercio || "",
    producto: p.producto?.nombre || p.producto || "",
    precio: p.precio,
    moneda: p.moneda,
  }));

  renderTable(["comercio", "producto", "precio", "moneda"], rows);
});

formComercio?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(formComercio);

  const nombre = formData.get("nombre");
  const rubro = formData.get("rubro");
  const direccion = formData.get("direccion");
  const lat = parseFloat(formData.get("lat"));
  const lng = parseFloat(formData.get("lng"));
  const mediosRaw = (formData.get("medios_pago") || "").toString();

  const body = {
    nombre,
    rubro,
    direccion,
    ubicacion: {
      type: "Point",
      coordinates: [lng, lat],
    },
    horarios: "sin definir",
    medios_pago: mediosRaw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  };

  try {
    setStatus("Guardando comercio...");
    const res = await fetch("/comercios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(errText || res.status.toString());
    }

    setStatus("Comercio creado correctamente.");
    formComercio.reset();
  } catch (err) {
    console.error(err);
    setStatus("No se pudo crear el comercio.", true);
  }
});

btnCanasta?.addEventListener("click", async () => {
  try {
    setStatus("Buscando productos de la canasta...");

    // 1) Traer todos los productos
    const resProd = await fetch("/productos");
    if (!resProd.ok) throw new Error("Error cargando productos");
    const productos = await resProd.json();

    // 2) Buscar por nombre (adaptá esto a los nombres reales del seed)
    const nombresCanasta = [
      "Leche Entera 1L",
      "Arroz 1Kg",
      "Aceite Girasol 900ml"
    ];

    const seleccionados = productos.filter((p) =>
      nombresCanasta.includes(p.nombre)
    );

    if (seleccionados.length === 0) {
      setStatus("No se encontraron productos de la canasta.", true);
      return;
    }

    const ids = seleccionados.map((p) => p._id);

    // 3) Llamar al endpoint de analytics
    setStatus("Comparando canasta en los comercios...");
    const res = await fetch("/analytics/canasta", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productos: ids })
    });

    if (!res.ok) {
      throw new Error(`Error en analytics: ${res.status}`);
    }

    const data = await res.json();
    const resultados = data.resultados || [];

    if (resultados.length === 0) {
      setStatus("No hay precios registrados para esta canasta.", true);
      return;
    }

    // 4) Mostrar en tabla: comercio + totalCanasta
    const rows = resultados.map((r) => ({
      comercio: r.comercio?.nombre || r._id,
      totalCanasta: r.totalCanasta,
      detalle: (r.productosDetalle || [])
        .map((p) => p.nombre)
        .join(", ")
    }));

    renderTable(["comercio", "totalCanasta", "detalle"], rows);
    setStatus("Comparación de canasta lista.");
  } catch (err) {
    console.error(err);
    setStatus("Error al comparar la canasta.", true);
  }
});

async function cargarOpcionesComerciosYProductos() {
  try {
    console.log("Cargando opciones para selects...");
    // Comercios
    const resCom = await fetch("/comercios");
    if (resCom.ok) {
      const comercios = await resCom.json();
      console.log("Comercios:", comercios);
      if (selectComercio) {
        selectComercio.innerHTML = `<option value="">Selecciona un comercio</option>`;
        comercios.forEach((c) => {
          const opt = document.createElement("option");
          opt.value = c._id;
          opt.textContent = `${c.nombre} (${c.rubro || ""})`;
          selectComercio.appendChild(opt);
        });
      }
    } else {
      console.error("Error fetching comercios:", resCom.status);
    }

    // Productos
    const resProd = await fetch("/productos");
    if (resProd.ok) {
      const productos = await resProd.json();
      console.log("Productos:", productos);
      if (selectProducto) {
        selectProducto.innerHTML = `<option value="">Selecciona un producto existente (opcional)</option>`;
        productos.forEach((p) => {
          const opt = document.createElement("option");
          opt.value = p._id;
          opt.textContent = `${p.nombre} - ${p.marca || ""}`;
          selectProducto.appendChild(opt);
        });
      }
    } else {
      console.error("Error fetching productos:", resProd.status);
    }
  } catch (err) {
    console.error("Error en cargarOpciones:", err);
    setStatus("Error cargando comercios/productos", true);
  }
}

cargarOpcionesComerciosYProductos();

formProductoPrecio?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(formProductoPrecio);

  const comercioId = formData.get("comercioId");
  const productoIdExistente = formData.get("productoId");

  const nuevoNombre = formData.get("nuevoNombre")?.toString().trim();
  const nuevoMarca = formData.get("nuevoMarca")?.toString().trim();
  const nuevoCategoria = formData.get("nuevoCategoria")?.toString().trim();

  const precioValor = parseFloat(formData.get("precio"));
  const moneda = formData.get("moneda")?.toString().trim() || "UYU";
  const promo = formData.get("promo")?.toString().trim() || "ninguna";

  if (!comercioId) {
    setStatus("Seleccioná un comercio.", true);
    return;
  }

  if (!productoIdExistente && !nuevoNombre) {
    setStatus("Elegí un producto existente o creá uno nuevo.", true);
    return;
  }

  if (Number.isNaN(precioValor)) {
    setStatus("Ingresá un precio válido.", true);
    return;
  }

  try {
    setStatus("Guardando producto y precio...");

    let productoIdFinal = productoIdExistente;

    // Si no eligió producto existente, creo uno nuevo primero
    if (!productoIdFinal) {
      const bodyProducto = {
        nombre: nuevoNombre,
        marca: nuevoMarca || undefined,
        // categoriaNombre: nuevoCategoria || undefined, 
        // Nota: el backend espera categoriaId o nada, si no tenemos ID de categoria, 
        // podemos dejarlo sin categoria o adaptar el backend. 
        // Por ahora mandamos solo nombre y marca.
      };

      const resProd = await fetch("/productos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyProducto),
      });

      if (!resProd.ok) {
        const txt = await resProd.text();
        throw new Error(`Error creando producto: ${txt}`);
      }

      const prodCreado = await resProd.json();
      productoIdFinal = prodCreado._id;

      // recargar el select de productos para que aparezca el nuevo
      await cargarOpcionesComerciosYProductos();
    }

    // Ahora guardo el precio que vincula comercio + producto
    const bodyPrecio = {
      comercio: comercioId, // OJO: el backend espera "comercio" no "comercioId"
      producto: productoIdFinal, // OJO: el backend espera "producto" no "productoId"
      precio: precioValor,
      moneda,
      promo,
      fuente: "carga manual",
    };

    const resPrecio = await fetch("/precios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bodyPrecio),
    });

    if (!resPrecio.ok) {
      const txt = await resPrecio.text();
      throw new Error(`Error creando precio: ${txt}`);
    }

    setStatus("Producto y precio guardados correctamente.");
    formProductoPrecio.reset();

  } catch (err) {
    console.error(err);
    setStatus("No se pudo guardar el producto y el precio.", true);
  }
});