const fs = require("fs");
const readline = require("readline-sync");

/**
 * Representa una mesa del restaurante.
 * Gestiona su propio estado y su lista de consumiciones.
 */
class Mesa {
  #consumiciones = []; // Array privado de productos pedidos
  #libre = true;       // Estado de disponibilidad

  /**
   * @param {number} id - Identificador único de la mesa.
   */
  constructor(id) {
    this.id = id;
  }

  /** @returns {boolean} True si la mesa está libre. */
  obtenerEstado() {
    return this.#libre;
  }

  /**
   * Cambia el estado de la mesa. 
   * Si se libera, limpia automáticamente las consumiciones.
   */
  cambiarEstado() {
    if (this.#libre) {
      this.#libre = false;
    } else {
      this.#libre = true;
      this.#consumiciones = [];
    }
  }

  /** @returns {Array} Listado de productos pedidos. */
  obtenerConsumiciones() {
    return this.#consumiciones;
  }

  /**
   * Ordena y muestra la carta por consola para que el cliente elija.
   * @param {Array} carta - Lista de productos disponibles.
   */
  pedirConsumicion(carta) {
    //El orden de la carta 
    const ordenPrioridad = {
      primero: 1,
      segundo: 2,
      acompañamiento: 3,
      postre: 4,
      bebida: 5,
    };

    // Ordenar carta según la prioridad del tipo de plato
    carta.sort((a, b) => ordenPrioridad[a.tipo] - ordenPrioridad[b.tipo]);
    
    //Header
    const separador = "═".repeat(60);
    console.log(`\n${separador}`);
    console.log(`  MESA Nº ${this.id.toString().padStart(2, "0")} - CARTA DETALLADA`);
    console.log(separador);
  
    const hId = "ID".padEnd(4);
    const hPrecio = "PRECIO".padEnd(8);
    const hTipo = "TIPO".padEnd(16);
    const hNombre = "PRODUCTO";
    
    console.log(`${hId} | ${hPrecio} | ${hTipo} | ${hNombre}`);
    console.log("-".repeat(60));
    // Mostrar carta
    carta.forEach(({ id, tipo, nombre, precio }) => {
      const idStr = id.toString().padEnd(4);
      const precioStr = `${precio.toFixed(2)}€`.padEnd(8);
      const tipoStr = tipo.toUpperCase().padEnd(16);
      console.log(`${idStr} | ${precioStr} | ${tipoStr} | ${nombre}`);
    });

    console.log(`${separador}\n`);
  }

  /**
   * Añade un producto al listado de la cuenta de la mesa.
   * @param {Object} producto 
   */
  añadirALaCuenta(producto) {
    this.#consumiciones.push(producto);
    console.log(` ${producto.nombre} añadido.`);
  }
}

/**
 * Clase principal que gestiona el flujo del restaurante.
 */
class Restaurante {
  /**
   * @param {number} numMesas - Cantidad de mesas a crear.
   * @param {string} nombreCarta - Nombre del archivo JSON (sin .json).
   * @param {number} precioMenu - Precio fijo para el combo de menú completo.
   */
  constructor(numMesas, nombreCarta, precioMenu) {
    this.numMesas = numMesas;
    this.nombreCarta = nombreCarta;
    this.precio = precioMenu;
    this.carta = this.leerCarta();
    this.listaMesas = this.crearMesas();
    this.lanzar(); // Inicia el bucle de la aplicación
  }

  /**
   * Lee la carta desde un archivo JSON local.
   * @returns {Array} Objeto JSON con los platos.
   */
  leerCarta = () => {
    try {
      const data = fs.readFileSync(`./${this.nombreCarta}.json`, "utf-8");
      return JSON.parse(data);
    } catch (error) {
      console.error("Error al leer el archivo de carta:", error.message);
      return [];
    }
  };

  /** Instancia las mesas iniciales(SE CREAN TODAS LIBRES SIN CONSUMICIONES). */
  crearMesas() {
    let mesasCreadas = [];
    for (let i = 1; i <= this.numMesas; i++) {
      mesasCreadas.push(new Mesa(i));
    }
    return mesasCreadas;
  }

  /** Menú principal del sistema. */
  lanzar() {
    let salir = false;
    while (!salir) {
      console.log("\n--- RESTAURANTE: MENÚ PRINCIPAL ---");
      console.log("1. Mostrar mesas");
      console.log("2. Buscar mesa vacía");
      console.log("3. Seleccionar mesa");
      console.log("4. Salir");

      let opcion = readline.questionInt("Seleccione una opcion: ");

      switch (opcion) {
        case 1: this.mostrarMesas(); break;
        case 2: this.buscarMesaVacia(); break;
        case 3: this.seleccionarMesa(); break;
        case 4: salir = true; break;
        default: console.log("Opción incorrecta.");
      }
    }
  }

  /** Imprime el estado actual de todas las mesas y sus consumiciones. */
  mostrarMesas() {
    console.log("\n--- ESTADO DE LAS MESAS ---");
    this.listaMesas.forEach((m) => {
      //Se obtiene el estado de la mesa
      let estado = m.obtenerEstado() ? "Libre" : "Ocupada";
      //Se muestra el estado de la mesa
      console.log(`Mesa ${m.id}: [${estado}]`);
      //Si esta ocupada se muestran las consumiciones
      if (!m.obtenerEstado()) {
        console.log("  Consumiciones:", m.obtenerConsumiciones().map((c) => c.nombre).join(", ") || "Ninguna");
      }
    });
  }

  /** Busca la primera mesa libre y permite gestionarla inmediatamente. */
  buscarMesaVacia() {
    // Busca la primera mesa libre
    let mesaLibre = this.listaMesas.find((m) => m.obtenerEstado());
    if (mesaLibre) {
      // Si encuentra una mesa libre la ocupa y gestiona
      console.log(`\nOcupando la Mesa ${mesaLibre.id}...`);
      mesaLibre.cambiarEstado();
      this.menuMesa(mesaLibre);
    } else {
      console.log("\nLo sentimos, no hay mesas vacías.");
    }
  }

  /**
   * Lógica de gestión interna de una mesa (pedir y cobrar).
   * @param {Mesa} mesa 
   */
  menuMesa(mesa) {
    let volver = false;
    while (!volver) {
      console.log(`\n--- MENÚ MESA ${mesa.id} ---`);
      console.log("1. Pedir consumición");
      console.log("2. Pedir cuenta");
      console.log("3. Volver al menú principal");

      let opcion = readline.questionInt("Seleccione opcion: ");

      if (opcion === 1) {
        // Lógica de pedido
        // Se muestran las opciones de la carta
        mesa.pedirConsumicion(this.carta);
        // Se solicita el ID del producto
        let idElegido = readline.questionInt("Introduce el ID del producto: ");
        let productoEncontrado = this.carta.find((p) => p.id === idElegido);
        // Se anade el producto a la cuenta de la mesa 
        if (productoEncontrado) {
          mesa.añadirALaCuenta(productoEncontrado);
        } else {
          console.log(" Ese ID no existe en la carta.");
        }

      } else if (opcion === 2) {
        // Lógica de facturación
        // Se guardan las consumiciones de la mesa 
        let productos = [...mesa.obtenerConsumiciones()];
        // Si no hay consumiciones, se libera la mesa
        if (productos.length === 0) {
          console.log("\nLa mesa no tiene consumiciones. Liberando mesa...");
          mesa.cambiarEstado();
          volver = true;
        } else {
          let total = 0;
          let menusCompletos = 0;

          // Algoritmo para calcular cuántos "Menús del día" hay (1 de cada tipo clave)
          let hayMenu = true;
          while (hayMenu) {
            // Buscar los productos que forman el menú
            let idx1 = productos.findIndex((p) => p.tipo === "primero");
            let idx2 = productos.findIndex((p) => p.tipo === "segundo");
            let idxP = productos.findIndex((p) => p.tipo === "postre");
            let idxB = productos.findIndex((p) => p.tipo === "bebida");
            // Si los encontramos, se suman los precios y se eliminan
            if (idx1 !== -1 && idx2 !== -1 && idxP !== -1 && idxB !== -1) {
              menusCompletos++;
              total += this.precio;
              // Eliminar los productos que forman el menú (de atrás hacia adelante para no romper índices)
              let indices = [idx1, idx2, idxP, idxB].sort((a, b) => b - a);
              indices.forEach((i) => productos.splice(i, 1));
            } else {
              hayMenu = false;
            }
          }

          // Sumar productos restantes que no entraron en menús
          productos.forEach((p) => { total += p.precio; });

          // Impresión del Ticket
          console.log("\n==============================");
          console.log(`       TICKET MESA ${mesa.id}`);
          console.log("==============================");
          if (menusCompletos > 0) {
            console.log(`${menusCompletos}x Menú Completo .... ${(menusCompletos * this.precio).toFixed(2)}€`);
          }
          productos.forEach((p) => {
            console.log(`1x ${p.nombre.padEnd(18)} ${p.precio.toFixed(2)}€`);
          });
          console.log("------------------------------");
          console.log(`TOTAL A PAGAR:       ${total.toFixed(2)}€`);
          console.log("==============================\n");

          mesa.cambiarEstado();
          volver = true;
        }
      } else if (opcion === 3) {
        volver = true;
      }
    }
  }

  /** Permite seleccionar manualmente una mesa ocupada por su ID. */
  seleccionarMesa() {
    let ocupadas = this.listaMesas.filter((m) => !m.obtenerEstado());

    if (ocupadas.length === 0) {
      console.log("\nNo hay mesas ocupadas actualmente.");
      return;
    }

    console.log("\n--- MESAS OCUPADAS ---");
    ocupadas.forEach((m) => console.log(`Mesa ${m.id}`));

    let idMesa = readline.questionInt("Introduce el numero de la mesa a gestionar: ");
    let mesaSeleccionada = ocupadas.find((m) => m.id === idMesa);

    if (mesaSeleccionada) {
      this.menuMesa(mesaSeleccionada);
    } else {
      console.log("Esa mesa no está ocupada o no existe.");
    }
  }
}

// Inicialización del sistema
let r = new Restaurante(4, "carta", 15);
