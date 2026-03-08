use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    program::invoke,
    program_error::ProgramError,
    pubkey::Pubkey,
    rent::Rent,
    system_instruction,
    sysvar::Sysvar,
};

// ============================================================
// ESTRUCTURAS DE DATOS
// ============================================================

/// Datos del restaurante almacenados en la cuenta
#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct Restaurante {
    pub is_initialized: bool,       // 1 byte
    pub nombre: String,             // 4 + len bytes
    pub tipo_comida: String,        // 4 + len bytes (Mexicana, Italiana, China, etc.)
    pub ubicacion: String,          // 4 + len bytes (direccion o zona)
    pub calificacion: u8,           // 1 byte - del 1 al 10
    pub precio_promedio: u32,       // 4 bytes - precio promedio en centavos (ej: 1500 = $15.00)
}

/// Instrucciones del programa (CRUD)
#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub enum RestauranteInstruction {
    /// 0 - Crear nuevo restaurante
    Create {
        nombre: String,
        tipo_comida: String,
        ubicacion: String,
        calificacion: u8,
        precio_promedio: u32,
    },
    /// 1 - Leer/mostrar datos
    Read,
    /// 2 - Actualizar restaurante
    Update {
        nombre: String,
        tipo_comida: String,
        ubicacion: String,
        calificacion: u8,
        precio_promedio: u32,
    },
    /// 3 - Eliminar restaurante (cerrar cuenta)
    Delete,
}

// ============================================================
// ENTRYPOINT
// ============================================================

entrypoint!(process_instruction);

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    let instruction = RestauranteInstruction::try_from_slice(instruction_data)
        .map_err(|_| ProgramError::InvalidInstructionData)?;

    match instruction {
        RestauranteInstruction::Create {
            nombre,
            tipo_comida,
            ubicacion,
            calificacion,
            precio_promedio,
        } => {
            msg!("🍔 Instruccion: CREAR restaurante");
            create_restaurante(program_id, accounts, nombre, tipo_comida, ubicacion, calificacion, precio_promedio)
        }
        RestauranteInstruction::Read => {
            msg!("🔍 Instruccion: LEER restaurante");
            read_restaurante(program_id, accounts)
        }
        RestauranteInstruction::Update {
            nombre,
            tipo_comida,
            ubicacion,
            calificacion,
            precio_promedio,
        } => {
            msg!("✏️ Instruccion: ACTUALIZAR restaurante");
            update_restaurante(program_id, accounts, nombre, tipo_comida, ubicacion, calificacion, precio_promedio)
        }
        RestauranteInstruction::Delete => {
            msg!("🗑️ Instruccion: ELIMINAR restaurante");
            delete_restaurante(program_id, accounts)
        }
    }
}

// ============================================================
// CREATE - Crear nuevo restaurante
// ============================================================

fn create_restaurante(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    nombre: String,
    tipo_comida: String,
    ubicacion: String,
    calificacion: u8,
    precio_promedio: u32,
) -> ProgramResult {
    let accounts_iter = &mut accounts.iter();
    let payer = next_account_info(accounts_iter)?;
    let rest_account = next_account_info(accounts_iter)?;
    let system_program = next_account_info(accounts_iter)?;

    // Validar que el payer firmo
    if !payer.is_signer {
        msg!("❌ Error: el payer debe firmar la transaccion");
        return Err(ProgramError::MissingRequiredSignature);
    }

    // Validar calificacion entre 1 y 10
    if calificacion < 1 || calificacion > 10 {
        msg!("❌ Error: la calificacion debe ser entre 1 y 10");
        return Err(ProgramError::InvalidArgument);
    }

    // Validar precio mayor a 0
    if precio_promedio == 0 {
        msg!("❌ Error: el precio promedio debe ser mayor a 0");
        return Err(ProgramError::InvalidArgument);
    }

    // Crear los datos del restaurante
    let restaurante = Restaurante {
        is_initialized: true,
        nombre: nombre.clone(),
        tipo_comida: tipo_comida.clone(),
        ubicacion: ubicacion.clone(),
        calificacion,
        precio_promedio,
    };

    // Calcular espacio necesario
    let space = borsh::to_vec(&restaurante).unwrap().len();
    let rent = Rent::get()?;
    let lamports = rent.minimum_balance(space);

    // Crear la cuenta
    invoke(
        &system_instruction::create_account(
            payer.key,
            rest_account.key,
            lamports,
            space as u64,
            program_id,
        ),
        &[payer.clone(), rest_account.clone(), system_program.clone()],
    )?;

    // Serializar datos en la cuenta
    restaurante.serialize(&mut *rest_account.data.borrow_mut())?;

    msg!("✅ Restaurante creado exitosamente!");
    msg!("   Nombre: {}", nombre);
    msg!("   Tipo de comida: {}", tipo_comida);
    msg!("   Ubicacion: {}", ubicacion);
    msg!("   Calificacion: {}/10", calificacion);
    msg!("   Precio promedio: ${}.{}", precio_promedio / 100, precio_promedio % 100);
    msg!("   Cuenta: {}", rest_account.key);

    Ok(())
}

// ============================================================
// READ - Leer restaurante
// ============================================================

fn read_restaurante(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
) -> ProgramResult {
    let accounts_iter = &mut accounts.iter();
    let rest_account = next_account_info(accounts_iter)?;

    // Validar que la cuenta pertenece al programa
    if rest_account.owner != program_id {
        msg!("❌ Error: la cuenta no pertenece a este programa");
        return Err(ProgramError::IncorrectProgramId);
    }

    // Deserializar datos
    let restaurante = Restaurante::try_from_slice(&rest_account.data.borrow())?;

    if !restaurante.is_initialized {
        msg!("❌ Error: la cuenta no esta inicializada");
        return Err(ProgramError::UninitializedAccount);
    }

    msg!("🍔 ====== DATOS DEL RESTAURANTE ======");
    msg!("   Nombre: {}", restaurante.nombre);
    msg!("   Tipo de comida: {}", restaurante.tipo_comida);
    msg!("   Ubicacion: {}", restaurante.ubicacion);
    msg!("   Calificacion: {}/10", restaurante.calificacion);
    msg!("   Precio promedio: ${}.{}", restaurante.precio_promedio / 100, restaurante.precio_promedio % 100);
    msg!("   Cuenta: {}", rest_account.key);
    msg!("🍔 =====================================");

    Ok(())
}

// ============================================================
// UPDATE - Actualizar restaurante
// ============================================================

fn update_restaurante(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    nombre: String,
    tipo_comida: String,
    ubicacion: String,
    calificacion: u8,
    precio_promedio: u32,
) -> ProgramResult {
    let accounts_iter = &mut accounts.iter();
    let payer = next_account_info(accounts_iter)?;
    let rest_account = next_account_info(accounts_iter)?;

    // Validar firma
    if !payer.is_signer {
        msg!("❌ Error: el payer debe firmar");
        return Err(ProgramError::MissingRequiredSignature);
    }

    // Validar owner
    if rest_account.owner != program_id {
        msg!("❌ Error: la cuenta no pertenece a este programa");
        return Err(ProgramError::IncorrectProgramId);
    }

    // Leer datos actuales
    let old_rest = Restaurante::try_from_slice(&rest_account.data.borrow())?;
    if !old_rest.is_initialized {
        msg!("❌ Error: la cuenta no esta inicializada");
        return Err(ProgramError::UninitializedAccount);
    }

    // Validar calificacion
    if calificacion < 1 || calificacion > 10 {
        msg!("❌ Error: la calificacion debe ser entre 1 y 10");
        return Err(ProgramError::InvalidArgument);
    }

    // Validar precio
    if precio_promedio == 0 {
        msg!("❌ Error: el precio promedio debe ser mayor a 0");
        return Err(ProgramError::InvalidArgument);
    }

    // Crear datos actualizados
    let updated_rest = Restaurante {
        is_initialized: true,
        nombre: nombre.clone(),
        tipo_comida: tipo_comida.clone(),
        ubicacion: ubicacion.clone(),
        calificacion,
        precio_promedio,
    };

    // Verificar que los nuevos datos caben
    let new_data = borsh::to_vec(&updated_rest).unwrap();
    if new_data.len() > rest_account.data.borrow().len() {
        msg!("❌ Error: los nuevos datos son mas grandes que el espacio de la cuenta");
        return Err(ProgramError::AccountDataTooSmall);
    }

    // Escribir datos actualizados
    let mut account_data = rest_account.data.borrow_mut();
    let data_len = account_data.len();
    account_data[..new_data.len()].copy_from_slice(&new_data);
    // Limpiar bytes sobrantes
    for byte in account_data[new_data.len()..data_len].iter_mut() {
        *byte = 0;
    }

    msg!("✅ Restaurante actualizado!");
    msg!("   Antes: {} | Ahora: {}", old_rest.nombre, nombre);
    msg!("   Tipo de comida: {}", tipo_comida);
    msg!("   Ubicacion: {}", ubicacion);
    msg!("   Calificacion: {}/10", calificacion);
    msg!("   Precio promedio: ${}.{}", precio_promedio / 100, precio_promedio % 100);

    Ok(())
}

// ============================================================
// DELETE - Eliminar restaurante (cerrar cuenta)
// ============================================================

fn delete_restaurante(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
) -> ProgramResult {
    let accounts_iter = &mut accounts.iter();
    let payer = next_account_info(accounts_iter)?;
    let rest_account = next_account_info(accounts_iter)?;

    // Validar firma
    if !payer.is_signer {
        msg!("❌ Error: el payer debe firmar");
        return Err(ProgramError::MissingRequiredSignature);
    }

    // Validar owner
    if rest_account.owner != program_id {
        msg!("❌ Error: la cuenta no pertenece a este programa");
        return Err(ProgramError::IncorrectProgramId);
    }

    // Leer datos antes de borrar
    let restaurante = Restaurante::try_from_slice(&rest_account.data.borrow())?;

    msg!("🗑️ Eliminando restaurante: {}", restaurante.nombre);

    // Transferir lamports al payer (cierra la cuenta)
    let lamports = rest_account.lamports();
    **rest_account.try_borrow_mut_lamports()? = 0;
    **payer.try_borrow_mut_lamports()? += lamports;

    // Limpiar datos
    let mut data = rest_account.data.borrow_mut();
    for byte in data.iter_mut() {
        *byte = 0;
    }

    msg!("✅ Restaurante '{}' eliminado exitosamente!", restaurante.nombre);
    msg!("   {} lamports devueltos al payer", lamports);

    Ok(())
}
