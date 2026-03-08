// client.ts - Cliente CRUD para el Registro de Restaurantes 🍔

import * as web3 from "@solana/web3.js";
import * as borsh from "borsh";

// ============================================================
// ESQUEMAS BORSH - DESERIALIZAR CUENTA
// ============================================================

class Restaurante {
  is_initialized: boolean;
  nombre: string;
  tipo_comida: string;
  ubicacion: string;
  calificacion: number;
  precio_promedio: number;

  constructor(fields: {
    is_initialized: boolean;
    nombre: string;
    tipo_comida: string;
    ubicacion: string;
    calificacion: number;
    precio_promedio: number;
  }) {
    this.is_initialized = fields.is_initialized;
    this.nombre = fields.nombre;
    this.tipo_comida = fields.tipo_comida;
    this.ubicacion = fields.ubicacion;
    this.calificacion = fields.calificacion;
    this.precio_promedio = fields.precio_promedio;
  }
}

const RestauranteSchema = new Map([
  [
    Restaurante,
    {
      kind: "struct",
      fields: [
        ["is_initialized", "u8"],
        ["nombre", "string"],
        ["tipo_comida", "string"],
        ["ubicacion", "string"],
        ["calificacion", "u8"],
        ["precio_promedio", "u32"],
      ],
    },
  ],
]);

// ============================================================
// ESQUEMAS BORSH - INSTRUCCIONES
// ============================================================

// CREATE (variante 0)
class CreateInstruction {
  variant: number;
  nombre: string;
  tipo_comida: string;
  ubicacion: string;
  calificacion: number;
  precio_promedio: number;

  constructor(
    nombre: string,
    tipo_comida: string,
    ubicacion: string,
    calificacion: number,
    precio_promedio: number
  ) {
    this.variant = 0;
    this.nombre = nombre;
    this.tipo_comida = tipo_comida;
    this.ubicacion = ubicacion;
    this.calificacion = calificacion;
    this.precio_promedio = precio_promedio;
  }
}

const CreateSchema = new Map([
  [
    CreateInstruction,
    {
      kind: "struct",
      fields: [
        ["variant", "u8"],
        ["nombre", "string"],
        ["tipo_comida", "string"],
        ["ubicacion", "string"],
        ["calificacion", "u8"],
        ["precio_promedio", "u32"],
      ],
    },
  ],
]);

// READ (variante 1)
class ReadInstruction {
  variant: number;
  constructor() {
    this.variant = 1;
  }
}

const ReadSchema = new Map([
  [
    ReadInstruction,
    {
      kind: "struct",
      fields: [["variant", "u8"]],
    },
  ],
]);

// UPDATE (variante 2)
class UpdateInstruction {
  variant: number;
  nombre: string;
  tipo_comida: string;
  ubicacion: string;
  calificacion: number;
  precio_promedio: number;

  constructor(
    nombre: string,
    tipo_comida: string,
    ubicacion: string,
    calificacion: number,
    precio_promedio: number
  ) {
    this.variant = 2;
    this.nombre = nombre;
    this.tipo_comida = tipo_comida;
    this.ubicacion = ubicacion;
    this.calificacion = calificacion;
    this.precio_promedio = precio_promedio;
  }
}

const UpdateSchema = new Map([
  [
    UpdateInstruction,
    {
      kind: "struct",
      fields: [
        ["variant", "u8"],
        ["nombre", "string"],
        ["tipo_comida", "string"],
        ["ubicacion", "string"],
        ["calificacion", "u8"],
        ["precio_promedio", "u32"],
      ],
    },
  ],
]);

// DELETE (variante 3)
class DeleteInstruction {
  variant: number;
  constructor() {
    this.variant = 3;
  }
}

const DeleteSchema = new Map([
  [
    DeleteInstruction,
    {
      kind: "struct",
      fields: [["variant", "u8"]],
    },
  ],
]);

// ============================================================
// FUNCION AUXILIAR - Formatear precio
// ============================================================

function formatPrecio(centavos: number): string {
  const dolares = Math.floor(centavos / 100);
  const cents = centavos % 100;
  return `$${dolares}.${cents.toString().padStart(2, "0")}`;
}

// ============================================================
// FUNCIONES CRUD
// ============================================================

async function createRestaurante(
  connection: web3.Connection,
  payer: web3.Keypair,
  programId: web3.PublicKey,
  nombre: string,
  tipo_comida: string,
  ubicacion: string,
  calificacion: number,
  precio_promedio: number
): Promise<web3.Keypair> {
  console.log("\n🍔 ====== CREAR RESTAURANTE ======");

  const restAccount = web3.Keypair.generate();

  const instruction = new CreateInstruction(
    nombre,
    tipo_comida,
    ubicacion,
    calificacion,
    precio_promedio
  );
  const data = Buffer.from(borsh.serialize(CreateSchema, instruction));

  const tx = new web3.Transaction().add(
    new web3.TransactionInstruction({
      keys: [
        { pubkey: payer.publicKey, isSigner: true, isWritable: true },
        { pubkey: restAccount.publicKey, isSigner: true, isWritable: true },
        {
          pubkey: web3.SystemProgram.programId,
          isSigner: false,
          isWritable: false,
        },
      ],
      programId: programId,
      data: data,
    })
  );

  const sig = await web3.sendAndConfirmTransaction(connection, tx, [
    payer,
    restAccount,
  ]);

  console.log(`✅ Restaurante creado!`);
  console.log(`   Nombre:          ${nombre}`);
  console.log(`   Tipo de comida:  ${tipo_comida}`);
  console.log(`   Ubicacion:       ${ubicacion}`);
  console.log(`   Calificacion:    ${calificacion}/10`);
  console.log(`   Precio promedio: ${formatPrecio(precio_promedio)}`);
  console.log(`   Cuenta:          ${restAccount.publicKey.toBase58()}`);
  console.log(`   TX: ${sig}`);

  return restAccount;
}

async function readRestaurante(
  connection: web3.Connection,
  payer: web3.Keypair,
  programId: web3.PublicKey,
  restAccountPubkey: web3.PublicKey
): Promise<Restaurante | null> {
  console.log("\n🔍 ====== LEER RESTAURANTE ======");

  // Leer directamente de la cuenta
  const accountInfo = await connection.getAccountInfo(restAccountPubkey);

  if (!accountInfo) {
    console.log("❌ Cuenta no encontrada (puede haber sido eliminada)");
    return null;
  }

  const restaurante = borsh.deserialize(
    RestauranteSchema,
    Restaurante,
    accountInfo.data
  );

  console.log(`🍽️  Datos del restaurante:`);
  console.log(`   Nombre:          ${restaurante.nombre}`);
  console.log(`   Tipo de comida:  ${restaurante.tipo_comida}`);
  console.log(`   Ubicacion:       ${restaurante.ubicacion}`);
  console.log(`   Calificacion:    ${restaurante.calificacion}/10`);
  console.log(`   Precio promedio: ${formatPrecio(restaurante.precio_promedio)}`);
  console.log(`   Cuenta:          ${restAccountPubkey.toBase58()}`);

  // Tambien llamar al programa para logs on-chain
  const instruction = new ReadInstruction();
  const data = Buffer.from(borsh.serialize(ReadSchema, instruction));

  const tx = new web3.Transaction().add(
    new web3.TransactionInstruction({
      keys: [
        { pubkey: restAccountPubkey, isSigner: false, isWritable: false },
      ],
      programId: programId,
      data: data,
    })
  );

  const sig = await web3.sendAndConfirmTransaction(connection, tx, [payer]);
  console.log(`   TX (read on-chain): ${sig}`);

  return restaurante;
}

async function updateRestaurante(
  connection: web3.Connection,
  payer: web3.Keypair,
  programId: web3.PublicKey,
  restAccountPubkey: web3.PublicKey,
  nombre: string,
  tipo_comida: string,
  ubicacion: string,
  calificacion: number,
  precio_promedio: number
): Promise<void> {
  console.log("\n✏️  ====== ACTUALIZAR RESTAURANTE ======");

  const instruction = new UpdateInstruction(
    nombre,
    tipo_comida,
    ubicacion,
    calificacion,
    precio_promedio
  );
  const data = Buffer.from(borsh.serialize(UpdateSchema, instruction));

  const tx = new web3.Transaction().add(
    new web3.TransactionInstruction({
      keys: [
        { pubkey: payer.publicKey, isSigner: true, isWritable: true },
        { pubkey: restAccountPubkey, isSigner: false, isWritable: true },
      ],
      programId: programId,
      data: data,
    })
  );

  const sig = await web3.sendAndConfirmTransaction(connection, tx, [payer]);

  console.log(`✅ Restaurante actualizado!`);
  console.log(`   Nombre:          ${nombre}`);
  console.log(`   Tipo de comida:  ${tipo_comida}`);
  console.log(`   Ubicacion:       ${ubicacion}`);
  console.log(`   Calificacion:    ${calificacion}/10`);
  console.log(`   Precio promedio: ${formatPrecio(precio_promedio)}`);
  console.log(`   TX: ${sig}`);
}

async function deleteRestaurante(
  connection: web3.Connection,
  payer: web3.Keypair,
  programId: web3.PublicKey,
  restAccountPubkey: web3.PublicKey
): Promise<void> {
  console.log("\n🗑️  ====== ELIMINAR RESTAURANTE ======");

  const instruction = new DeleteInstruction();
  const data = Buffer.from(borsh.serialize(DeleteSchema, instruction));

  const tx = new web3.Transaction().add(
    new web3.TransactionInstruction({
      keys: [
        { pubkey: payer.publicKey, isSigner: true, isWritable: true },
        { pubkey: restAccountPubkey, isSigner: false, isWritable: true },
      ],
      programId: programId,
      data: data,
    })
  );

  const sig = await web3.sendAndConfirmTransaction(connection, tx, [payer]);

  console.log(`✅ Restaurante eliminado!`);
  console.log(`   Cuenta cerrada: ${restAccountPubkey.toBase58()}`);
  console.log(`   TX: ${sig}`);
}

// ============================================================
// FUNCION PRINCIPAL - EJECUTAR TODO EL CRUD
// ============================================================

async function main() {
  console.log("🍔🍕🌮 REGISTRO DE RESTAURANTES - SOLANA CRUD 🌮🍕🍔\n");

  const connection = pg.connection;
  const payer = pg.wallet.keypair;
  const programId = pg.PROGRAM_ID;

  console.log(`Programa: ${programId.toBase58()}`);
  console.log(`Wallet:   ${payer.publicKey.toBase58()}`);

  // ==========================================
  // 1. CREATE - Crear restaurante mexicano
  // ==========================================
  const rest1 = await createRestaurante(
    connection,
    payer,
    programId,
    "Tacos El Primo",     // nombre
    "Mexicana",           // tipo de comida
    "Av. Reforma 123",    // ubicacion
    9,                    // calificacion
    1500                  // precio promedio: $15.00
  );

  await new Promise((r) => setTimeout(r, 2000));

  // ==========================================
  // 2. READ - Leer restaurante 1
  // ==========================================
  await readRestaurante(connection, payer, programId, rest1.publicKey);

  await new Promise((r) => setTimeout(r, 2000));

  // ==========================================
  // 3. CREATE - Crear restaurante italiano
  // ==========================================
  const rest2 = await createRestaurante(
    connection,
    payer,
    programId,
    "Pizza Roma",          // nombre
    "Italiana",            // tipo de comida
    "Calle Luna 456",      // ubicacion
    8,                     // calificacion
    2500                   // precio promedio: $25.00
  );

  await new Promise((r) => setTimeout(r, 2000));

  // ==========================================
  // 4. READ - Leer restaurante 2
  // ==========================================
  await readRestaurante(connection, payer, programId, rest2.publicKey);

  await new Promise((r) => setTimeout(r, 2000));

  // ==========================================
  // 5. CREATE - Crear restaurante japones
  // ==========================================
  const rest3 = await createRestaurante(
    connection,
    payer,
    programId,
    "Sushi Master",        // nombre
    "Japonesa",            // tipo de comida
    "Plaza Central 78",    // ubicacion
    10,                    // calificacion
    3500                   // precio promedio: $35.00
  );

  await new Promise((r) => setTimeout(r, 2000));

  // ==========================================
  // 6. UPDATE - Actualizar restaurante 1
  //    (subio de precio y cambio ubicacion)
  // ==========================================
  await updateRestaurante(
    connection,
    payer,
    programId,
    rest1.publicKey,
    "Tacos El Primo",      // mismo nombre
    "Mexicana",            // mismo tipo
    "Av. Reforma 999",     // nueva ubicacion (igual o menor largo)
    10,                    // nueva calificacion
    1800                   // nuevo precio: $18.00
  );

  await new Promise((r) => setTimeout(r, 2000));

  // ==========================================
  // 7. READ - Verificar actualizacion
  // ==========================================
  console.log("\n📋 Verificando actualizacion del restaurante 1...");
  await readRestaurante(connection, payer, programId, rest1.publicKey);

  await new Promise((r) => setTimeout(r, 2000));

  // ==========================================
  // 8. DELETE - Eliminar restaurante 2
  // ==========================================
  await deleteRestaurante(connection, payer, programId, rest2.publicKey);

  await new Promise((r) => setTimeout(r, 2000));

  // ==========================================
  // 9. READ - Intentar leer el eliminado
  // ==========================================
  console.log("\n🔍 Intentando leer restaurante eliminado...");
  await readRestaurante(connection, payer, programId, rest2.publicKey);

  await new Promise((r) => setTimeout(r, 2000));

  // ==========================================
  // 10. READ - Los que siguen vivos
  // ==========================================
  console.log("\n📋 ====== RESTAURANTES ACTIVOS ======");
  await readRestaurante(connection, payer, programId, rest1.publicKey);
  await new Promise((r) => setTimeout(r, 1000));
  await readRestaurante(connection, payer, programId, rest3.publicKey);

  // ==========================================
  // 11. LIMPIEZA - Eliminar los restantes
  // ==========================================
  await new Promise((r) => setTimeout(r, 2000));
  await deleteRestaurante(connection, payer, programId, rest1.publicKey);
  await new Promise((r) => setTimeout(r, 1000));
  await deleteRestaurante(connection, payer, programId, rest3.publicKey);

  console.log("\n🏁🏁🏁 CRUD COMPLETO EJECUTADO EXITOSAMENTE 🏁🏁🏁");
}

// Ejecutar
main();
