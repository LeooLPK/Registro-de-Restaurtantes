const program = pg.program;
const wallet = pg.wallet;

// ============================================================
// CAMBIA AQUI TUS RESTAURANTES 👇👇👇
// ============================================================

// Restaurante 1
const nombre1 = "Burger King";
const tipo1 = "Hamburguesas";
const ubicacion1 = "Plaza Norte 100";
const calificacion1 = 7;        // del 1 al 10
const precio1 = 1200;           // $12.00

// Restaurante 2
const nombre2 = "Sushi Roll";
const tipo2 = "Japonesa";
const ubicacion2 = "Av Central 250";
const calificacion2 = 9;
const precio2 = 3500;           // $35.00

// Restaurante 3
const nombre3 = "Pizza Hut";
const tipo3 = "Italiana";
const ubicacion3 = "Mall Sur 80";
const calificacion3 = 8;
const precio3 = 2000;           // $20.00

// Datos para ACTUALIZAR el restaurante 1
const nombre1update = "Burger King VIP";
const tipo1update = "Gourmet";
const ubicacion1update = "Plaza Premium";
const calificacion1update = 10;
const precio1update = 1800;     // $18.00

// ============================================================
// NO TOQUES DE AQUI PARA ABAJO 👇
// ============================================================

// --- CREAR RESTAURANTE 1 ---
console.log("--- CREAR RESTAURANTE 1 ---");
const rest1 = web3.Keypair.generate();
await program.methods
  .create(nombre1, tipo1, ubicacion1, calificacion1, precio1)
  .accounts({
    restaurante: rest1.publicKey,
    owner: wallet.publicKey,
    systemProgram: web3.SystemProgram.programId,
  })
  .signers([rest1])
  .rpc();
console.log("Creado: " + nombre1);

// --- CREAR RESTAURANTE 2 ---
console.log("\n--- CREAR RESTAURANTE 2 ---");
const rest2 = web3.Keypair.generate();
await program.methods
  .create(nombre2, tipo2, ubicacion2, calificacion2, precio2)
  .accounts({
    restaurante: rest2.publicKey,
    owner: wallet.publicKey,
    systemProgram: web3.SystemProgram.programId,
  })
  .signers([rest2])
  .rpc();
console.log("Creado: " + nombre2);

// --- CREAR RESTAURANTE 3 ---
console.log("\n--- CREAR RESTAURANTE 3 ---");
const rest3 = web3.Keypair.generate();
await program.methods
  .create(nombre3, tipo3, ubicacion3, calificacion3, precio3)
  .accounts({
    restaurante: rest3.publicKey,
    owner: wallet.publicKey,
    systemProgram: web3.SystemProgram.programId,
  })
  .signers([rest3])
  .rpc();
console.log("Creado: " + nombre3);

// --- LEER TODOS ---
console.log("\n--- TODOS LOS RESTAURANTES ---");

const d1 = await program.account.restaurante.fetch(rest1.publicKey);
console.log("1) " + d1.nombre + " | " + d1.tipoComida + " | " + d1.ubicacion + " | " + d1.calificacion + "/10 | $" + d1.precioPromedio);

const d2 = await program.account.restaurante.fetch(rest2.publicKey);
console.log("2) " + d2.nombre + " | " + d2.tipoComida + " | " + d2.ubicacion + " | " + d2.calificacion + "/10 | $" + d2.precioPromedio);

const d3 = await program.account.restaurante.fetch(rest3.publicKey);
console.log("3) " + d3.nombre + " | " + d3.tipoComida + " | " + d3.ubicacion + " | " + d3.calificacion + "/10 | $" + d3.precioPromedio);

// --- ACTUALIZAR RESTAURANTE 1 ---
console.log("\n--- ACTUALIZAR RESTAURANTE 1 ---");
await program.methods
  .update(nombre1update, tipo1update, ubicacion1update, calificacion1update, precio1update)
  .accounts({
    restaurante: rest1.publicKey,
    owner: wallet.publicKey,
  })
  .rpc();
console.log("Actualizado: " + nombre1 + " -> " + nombre1update);

// --- VERIFICAR UPDATE ---
console.log("\n--- VERIFICAR UPDATE ---");
const u1 = await program.account.restaurante.fetch(rest1.publicKey);
console.log("1) " + u1.nombre + " | " + u1.tipoComida + " | " + u1.ubicacion + " | " + u1.calificacion + "/10 | $" + u1.precioPromedio);

// --- ELIMINAR RESTAURANTE 2 ---
console.log("\n--- ELIMINAR RESTAURANTE 2 ---");
await program.methods
  .delete()
  .accounts({
    restaurante: rest2.publicKey,
    owner: wallet.publicKey,
  })
  .rpc();
console.log("Eliminado: " + nombre2);

// --- VERIFICAR ELIMINACION ---
console.log("\n--- VERIFICAR ELIMINACION ---");
try {
  await program.account.restaurante.fetch(rest2.publicKey);
} catch (e) {
  console.log(nombre2 + " fue eliminado correctamente");
}

// --- RESTAURANTES ACTIVOS ---
console.log("\n--- RESTAURANTES ACTIVOS ---");
const f1 = await program.account.restaurante.fetch(rest1.publicKey);
console.log("1) " + f1.nombre + " | " + f1.tipoComida + " | " + f1.ubicacion + " | " + f1.calificacion + "/10 | $" + f1.precioPromedio);

const f3 = await program.account.restaurante.fetch(rest3.publicKey);
console.log("2) " + f3.nombre + " | " + f3.tipoComida + " | " + f3.ubicacion + " | " + f3.calificacion + "/10 | $" + f3.precioPromedio);

console.log("\n--- CRUD COMPLETO ---");
