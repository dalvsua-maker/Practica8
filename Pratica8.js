const fs = require("fs");
const readline = require("readline-sync");

class Mesa {
  #consumiciones = [];
  #libre = true;





  constructor(id) {
    this.id = id;
  }



  obtenerEstado() {
    return this.#libre;
  }
  cambiarEstado() {
    if (this.#libre) {
      this.#libre = false;
    } else {
      this.#libre = true;
      this.#consumiciones = [];
    }
  }
  obtenerConsumiciones() {
    return this.#consumiciones;
  }
  pedirConsumicion(carta) {
    const ordenPrioridad = {
      primero: 1,
      segundo: 2,
      acompañamiento: 3,
      postre: 4,
      bebida: 5,
    };

    carta.sort((a, b) => ordenPrioridad[a.tipo] - ordenPrioridad[b.tipo]);
    const separador = "═".repeat(60);

    console.log(`\n${separador}`);
    console.log(
      `  MESA Nº ${this.id.toString().padStart(2, "0")} - CARTA DETALLADA`,
    );
    console.log(separador);


    const hId = "ID".padEnd(4);
    const hPrecio = "PRECIO".padEnd(8);
    const hTipo = "TIPO".padEnd(16);
    const hNombre = "PRODUCTO";

    console.log(`${hId} | ${hPrecio} | ${hTipo} | ${hNombre}`);
    console.log("-".repeat(60));

    carta.forEach(({ id, tipo, nombre, precio }) => {
      const idStr = id.toString().padEnd(4);
      const precioStr = `${precio.toFixed(2)}€`.padEnd(8);
      const tipoStr = tipo.toUpperCase().padEnd(16);
      const nombreStr = nombre;

      console.log(`${idStr} | ${precioStr} | ${tipoStr} | ${nombreStr}`);
    });

    console.log(`${separador}\n`);
  }

  añadirALaCuenta(producto) {
    this.#consumiciones.push(producto);
    console.log(` ${producto.nombre} añadido.`);
  }
}

class Restaurante {
  constructor(numMesas, nombreCarta, precioMenu) {
    this.numMesas = numMesas;
    this.nombreCarta = nombreCarta;
    this.precio = precioMenu;
    this.carta = this.leerCarta();
    this.listaMesas = this.crearMesas();
    this.lanzar();
  }

  leerCarta = () => {
    const data = fs.readFileSync(`./${this.nombreCarta}.json`, "utf-8");
    return JSON.parse(data);
  };

  crearMesas() {
    let mesasCreadas = [];
    for (let i = 1; i <= this.numMesas; i++) {
      mesasCreadas.push(new Mesa(i));
    }
    return mesasCreadas;
  }
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
        case 1:
          this.mostrarMesas();
          break;
        case 2:
          this.buscarMesaVacia();
          break;
        case 3:
          this.seleccionarMesa();
          break;
        case 4:
          salir = true;
          break;
        default:
          console.log("Opción incorrecta.");
      }
    }
  }

  mostrarMesas() {
    console.log("\n--- ESTADO DE LAS MESAS ---");
    this.listaMesas.forEach((m) => {
      let estado = m.obtenerEstado() ? "Libre" : "Ocupada";
      console.log(`Mesa ${m.id}: [${estado}]`);
      if (!m.obtenerEstado()) {
        console.log(
          "  Consumiciones:",
          m
            .obtenerConsumiciones()
            .map((c) => c.nombre)
            .join(", ") || "Ninguna",
        );
      }
    });
  }

  buscarMesaVacia() {
    let mesaLibre = this.listaMesas.find((m) => m.obtenerEstado());

    if (mesaLibre) {
      console.log(`\nOcupando la Mesa ${mesaLibre.id}...`);
      mesaLibre.cambiarEstado();
      this.menuMesa(mesaLibre);
    } else {
      console.log("\nLo sentimos, no hay mesas vacías.");
    }
  }

  menuMesa(mesa) {
    let volver = false;
    while (!volver) {
      console.log(`\n--- MENÚ MESA ${mesa.id} ---`);
      console.log("1. Pedir consumición");
      console.log("2. Pedir cuenta");
      console.log("3. Volver al menú principal");

      let opcion = readline.questionInt("Seleccione opcion: ");

      if (opcion === 1) {
        mesa.pedirConsumicion(this.carta);

        let idElegido = readline.questionInt(
          "Introduce el ID del producto que quieres pedir: ",
        );

        let productoEncontrado = this.carta.find((p) => p.id === idElegido);

        if (productoEncontrado) {
          mesa.añadirALaCuenta(productoEncontrado);
        } else {
          console.log(" Ese ID no existe en la carta.");
        }
      } else if (opcion === 2) {
        let productos = [...mesa.obtenerConsumiciones()];

        if (productos.length === 0) {
          console.log("\nLa mesa no tiene consumiciones. Liberando mesa...");
          mesa.cambiarEstado();
          volver = true;
        } else {
          let total = 0;
          let menusCompletos = 0;
          let copiaParaTicket = [...productos];

          let hayMenu = true;
          while (hayMenu) {
            let idx1 = productos.findIndex((p) => p.tipo === "primero");
            let idx2 = productos.findIndex((p) => p.tipo === "segundo");
            let idxP = productos.findIndex((p) => p.tipo === "postre");
            let idxB = productos.findIndex((p) => p.tipo === "bebida");

            if (idx1 !== -1 && idx2 !== -1 && idxP !== -1 && idxB !== -1) {
              menusCompletos++;
              total += this.precio;

              let indices = [idx1, idx2, idxP, idxB].sort((a, b) => b - a);
              indices.forEach((i) => productos.splice(i, 1));
            } else {
              hayMenu = false;
            }
          }

          productos.forEach((p) => {
            total += p.precio;
          });

          console.log("\n==============================");
          console.log(`       TICKET MESA ${mesa.id}`);
          console.log("==============================");
          if (menusCompletos > 0) {
            console.log(
              `${menusCompletos}x Menú Completo .... ${(menusCompletos * this.precio).toFixed(2)}€`,
            );
          }

          productos.forEach((p) => {
            console.log(`1x ${p.nombre.padEnd(18)} ${p.precio.toFixed(2)}€`);
          });
          console.log("------------------------------");
          console.log(`TOTAL A PAGAR:       ${total.toFixed(2)}€`);
          console.log("==============================\n");

          mesa.cambiarEstado();
          console.log(`Mesa ${mesa.id} pagada y liberada.`);
          volver = true;
        }
      } else if (opcion === 3) {
        volver = true;
      }
    }
  }

  seleccionarMesa() {
    let ocupadas = this.listaMesas.filter((m) => !m.obtenerEstado());

    if (ocupadas.length === 0) {
      console.log("\nNo hay mesas ocupadas actualmente.");
      return;
    }

    console.log("\n--- MESAS OCUPADAS ---");
    ocupadas.forEach((m) => console.log(`Mesa ${m.id}`));

    let idMesa = readline.questionInt(
      "Introduce el numero de la mesa a gestionar: ",
    );
    let mesaSeleccionada = ocupadas.find((m) => m.id === idMesa);

    if (mesaSeleccionada) {
      this.menuMesa(mesaSeleccionada);
    } else {
      console.log("Esa mesa no está ocupada o no existe.");
    }
  }
}

let r = new Restaurante(4, "carta", 15);
