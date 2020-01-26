const IdPrefix = 'ectn'

const BipedFlag_39 = 512

function GetRecord(handle, path) {
    const fileName = xelib.GetFileName(handle);
    return xelib.GetElement(0, `${fileName}\\${path}`);
}

function NewRecord(handle, path, name) {
    const record = xelib.AddElement(handle, `${path}\\${path}`);
    xelib.AddElementValue(record, 'EDID', name);
    return record;
}

function IsUsable(record, type = false) {
    if (xelib.EditorID(record) == '')
        return false;

    if (xelib.GetRecordFlag(record, 'Non-Playable'))
        return false;

    if (!type) {
        if (xelib.GetValue(record, 'MODL\\MODL') == '')
            return false;

        if (!xelib.GetValue(record, 'MODL\\MODL').toLowerCase().includes('.nif'))
            return false;

        if (xelib.GetFlag(record, 'DNAM\\Flags', 'Non-playable'))
            return false;
    }
    else {
        if (xelib.GetValue(record, 'MOD2\\MOD2') == '')
            return false;

        if (!xelib.GetValue(record, 'MOD2\\MOD2').toLowerCase().includes('.nif'))
            return false;
    }
    
    return true;
}

function GetShortHex(record) {
    return xelib.GetHexFormID(record).slice(2).replace(/^0+/, '');
}

function AppendData(name, hex) {
    return `__formData|${name}|0x${hex}`;
}

function FileExists(path) {
    return fh.jetpack.exists(path) === 'file';
}

function AddData(locals, record) {
    const master = xelib.GetMasterRecord(record);
    const masterName = xelib.GetFileName(xelib.GetElementFile(master));

    const data = AppendData(masterName, GetShortHex(record));

    locals.jsonData["FormsMap"][data] = {};

    return data;
}

function AddWeapon(patchFile, helpers, settings, locals, record) {
    const id = xelib.GetValue(record, 'EDID');

    const model = xelib.GetValue(record, 'MODL\\MODL');
    const modelSub = model.substring(0, model.lastIndexOf('.'));
    const modelWeapon = modelSub + 'Left.nif'
    const modelSheath = modelSub + 'Sheath.nif'

    const fileWeapon = FileExists(locals.dataPath + '\\Meshes\\' + modelWeapon);
    const fileSheath = FileExists(locals.dataPath + '\\Meshes\\' + modelSheath);

    if (!fileWeapon || !fileSheath)
        return;

    const data = AddData(locals, record);

    if (fileWeapon) {
        const leftWeaponAA = xelib.CopyElement(locals.templateARMA, patchFile, true);
        xelib.SetValue(leftWeaponAA, 'EDID', IdPrefix + id + 'AALeft');
        xelib.AddElementValue(leftWeaponAA, 'Male world model\\MOD2', modelWeapon);    
        xelib.SetUIntValue(leftWeaponAA, 'BOD2\\First Person Flags', settings.leftBipedSlot, true);

        const leftWeapon = xelib.CopyElement(locals.templateARMO, patchFile, true);
        xelib.SetValue(leftWeapon, 'EDID', IdPrefix + id + 'Left');
        xelib.AddElementValue(leftWeapon, 'Armature\\[0]', xelib.LongName(leftWeaponAA));    
        xelib.SetUIntValue(leftWeapon, 'BOD2\\First Person Flags', settings.leftBipedSlot, true);
        xelib.AddKeyword(leftWeapon, locals.keywordLeftWeapon);   

        locals.jsonData["FormsMap"][data]['LeftWeaponFormID'] = AppendData(settings.patchFileName, GetShortHex(leftWeapon));
    }

    if (fileSheath) {
        const leftSheathAA = xelib.CopyElement(locals.templateARMA, patchFile, true);
        xelib.SetValue(leftSheathAA, 'EDID', IdPrefix + id + 'AASheath');
        xelib.AddElementValue(leftSheathAA, 'Male world model\\MOD2', modelSheath);
        xelib.SetUIntValue(leftSheathAA, 'BOD2\\First Person Flags', settings.leftBipedSlot, true);

        const leftSheath = xelib.CopyElement(locals.templateARMO, patchFile, true);
        xelib.SetValue(leftSheath, 'EDID', IdPrefix + id + 'Sheath');
        xelib.AddElementValue(leftSheath, 'Armature\\[0]', xelib.LongName(leftSheathAA));  
        xelib.SetUIntValue(leftSheath, 'BOD2\\First Person Flags', settings.leftBipedSlot, true);
        xelib.AddKeyword(leftSheath, locals.keywordLeftSheath);  

        locals.jsonData['FormsMap'][data]['LeftSheathFormID'] = AppendData(settings.patchFileName, GetShortHex(leftSheath));
    }
}

function AddStaff(patchFile, helpers, settings, locals, record) {
    const id = xelib.GetValue(record, 'EDID');

    const model = xelib.GetValue(record, 'MODL\\MODL');
    const modelSub = model.substring(0, model.lastIndexOf('.'));
    const modelLeft = modelSub + 'Left.nif';
    const modelRight = modelSub + 'Right.nif';

    const fileLeft = FileExists(locals.dataPath + '\\Meshes\\' + modelLeft);
    const fileRight = FileExists(locals.dataPath + '\\Meshes\\' + modelRight);

    if (!fileLeft || !fileRight)
        return;

    const data = AddData(locals, record);

    if (fileLeft) {
        const leftStaffAA = xelib.CopyElement(locals.templateARMA, patchFile, true);
        xelib.SetValue(leftStaffAA, 'EDID', IdPrefix + id + 'AALeft');
        xelib.AddElementValue(leftStaffAA, 'Male world model\\MOD2', modelLeft);    
        xelib.SetUIntValue(leftStaffAA, 'BOD2\\First Person Flags', settings.leftBipedSlot, true);

        const leftStaff = xelib.CopyElement(locals.templateARMO, patchFile, true);
        xelib.SetValue(leftStaff, 'EDID', IdPrefix + id + 'Left');
        xelib.AddElementValue(leftStaff, 'Armature\\[0]', xelib.LongName(leftStaffAA));    
        xelib.SetUIntValue(leftStaff, 'BOD2\\First Person Flags', settings.leftBipedSlot, true);
        xelib.AddKeyword(leftStaff, locals.keywordLeftStaff);

        locals.jsonData["FormsMap"][data]['LeftStaffFormID'] = AppendData(settings.patchFileName, GetShortHex(leftStaff));
    }

    if (fileRight) {
        const rightStaffAA = xelib.CopyElement(locals.templateARMA, patchFile, true);
        xelib.SetValue(rightStaffAA, 'EDID', IdPrefix + id + 'AARight');
        xelib.AddElementValue(rightStaffAA, 'Male world model\\MOD2', modelRight);    
        xelib.SetUIntValue(rightStaffAA, 'BOD2\\First Person Flags', settings.rightBipedSlot, true); 

        const rightStaff = xelib.CopyElement(locals.templateARMO, patchFile, true);
        xelib.SetValue(rightStaff, 'EDID', IdPrefix + id + 'Right');
        xelib.AddElementValue(rightStaff, 'Armature\\[0]', xelib.LongName(rightStaffAA));    
        xelib.SetUIntValue(rightStaff, 'BOD2\\First Person Flags', settings.rightBipedSlot, true);
        xelib.AddKeyword(rightStaff, locals.keywordRightStaff);

        locals.jsonData["FormsMap"][data]['RightStaffFormID'] = AppendData(settings.patchFileName, GetShortHex(rightStaff));
    }
}

function AddShield(patchFile, helpers, settings, locals, record) {
    const id = xelib.GetValue(record, 'EDID');

    const model = xelib.GetValue(record, 'Male world model\\MOD2');
    const modelSub = model.substring(0, model.lastIndexOf('.'))
    const modelOnBack = modelSub + 'OnBack.nif';
    const modelOnBackClk = modelSub + 'OnBackClk.nif';

    const fileOnBack = FileExists(locals.dataPath + '\\Meshes\\' + modelOnBack);
    const fileOnBackClk = FileExists(locals.dataPath + '\\Meshes\\' + modelOnBackClk);

    if (!fileOnBack || !fileOnBackClk)
        return;

    const data = AddData(locals, record);

    if (fileOnBack) {
        const shieldOnBackAA = xelib.CopyElement(locals.templateARMA, patchFile, true);
        xelib.SetValue(shieldOnBackAA, 'EDID', IdPrefix + id + 'AAOnBack');
        xelib.AddElementValue(shieldOnBackAA, 'Male world model\\MOD2', modelOnBack);   
        xelib.SetUIntValue(shieldOnBackAA, 'BOD2\\First Person Flags', settings.leftBipedSlot + BipedFlag_39);
        xelib.SetFlag(shieldOnBackAA, 'BOD2\\First Person Flags', '39 - Shield', true);

        const shieldOnBack = xelib.CopyElement(locals.templateARMO, patchFile, true); 
        xelib.SetValue(shieldOnBack, 'EDID', IdPrefix + id + 'OnBack');
        xelib.SetUIntValue(shieldOnBack, 'BOD2\\First Person Flags', settings.leftBipedSlot, true);
        xelib.AddElementValue(shieldOnBack, 'Armature\\[0]', xelib.LongName(shieldOnBackAA));   
        xelib.AddKeyword(shieldOnBack, locals.keywordShieldOnBack);

        const shieldOnBackNPC = xelib.CopyElement(locals.templateARMO, patchFile, true);
        xelib.SetValue(shieldOnBackNPC, 'EDID', IdPrefix + id + 'OnBackNPC');
        xelib.SetUIntValue(shieldOnBackNPC, 'BOD2\\First Person Flags', settings.leftBipedSlot + BipedFlag_39);
        xelib.SetFlag(shieldOnBackNPC, 'BOD2\\First Person Flags', '39 - Shield', true);
        xelib.AddElementValue(shieldOnBackNPC, 'Armature\\[0]', xelib.LongName(shieldOnBackAA));   
        xelib.AddKeyword(shieldOnBackNPC, locals.keywordShieldOnBack);

        locals.jsonData["FormsMap"][data]['ShieldOnBackFormID'] = AppendData(settings.patchFileName, GetShortHex(shieldOnBack));
        locals.jsonData["FormsMap"][data]['ShieldOnBackNPCFormID'] = AppendData(settings.patchFileName, GetShortHex(shieldOnBackNPC));
    }

    if (fileOnBackClk) {
        const shieldOnBackAAClk = xelib.CopyElement(locals.templateARMA, patchFile, true);
        xelib.SetValue(shieldOnBackAAClk, 'EDID', IdPrefix + id + 'AAOnBackClk');
        xelib.AddElementValue(shieldOnBackAAClk, 'Male world model\\MOD2', modelOnBackClk); 
        xelib.SetUIntValue(shieldOnBackAAClk, 'BOD2\\First Person Flags', settings.leftBipedSlot + BipedFlag_39);
        xelib.SetFlag(shieldOnBackAAClk, 'BOD2\\First Person Flags', '39 - Shield', true);

        const shieldOnBackClk = xelib.CopyElement(locals.templateARMO, patchFile, true);   
        xelib.SetValue(shieldOnBackClk, 'EDID', IdPrefix + id + 'OnBackClk');
        xelib.AddElementValue(shieldOnBackClk, 'Armature\\[0]', xelib.LongName(shieldOnBackAAClk)); 
        xelib.SetUIntValue(shieldOnBackClk, 'BOD2\\First Person Flags', settings.leftBipedSlot, true);
        xelib.AddKeyword(shieldOnBackClk, locals.keywordShieldOnBack);
        xelib.AddKeyword(shieldOnBackClk, locals.keywordShieldOnBackClk);

        const shieldOnBackClkNPC = xelib.CopyElement(locals.templateARMO, patchFile, true);
        xelib.SetValue(shieldOnBackClkNPC, 'EDID', IdPrefix + id + 'OnBackClkNPC');
        xelib.SetUIntValue(shieldOnBackClkNPC, 'BOD2\\First Person Flags', settings.leftBipedSlot + BipedFlag_39);
        xelib.SetFlag(shieldOnBackClkNPC, 'BOD2\\First Person Flags', '39 - Shield', true);
        xelib.AddElementValue(shieldOnBackClkNPC, 'Armature\\[0]', xelib.LongName(shieldOnBackAAClk));   
        xelib.AddKeyword(shieldOnBackClkNPC, locals.keywordShieldOnBack);
        xelib.AddKeyword(shieldOnBackClkNPC, locals.keywordShieldOnBackClk);

        locals.jsonData["FormsMap"][data]['ShieldOnBackClkFormID'] = AppendData(settings.patchFileName, GetShortHex(shieldOnBackClk));
        locals.jsonData["FormsMap"][data]['ShieldOnBackClkNPCFormID'] = AppendData(settings.patchFileName, GetShortHex(shieldOnBackClkNPC));
    }
}

registerPatcher({
    info: info,
    gameModes: [xelib.gmSSE],
    settings: {
        label: 'Ecotone Dual Sheath',
        templateUrl: `${patcherUrl}/partials/settings.html`,
        controller: function($scope) {},
        defaultSettings: {
            patchFileName: 'Ecotone Dual Sheath Patch.esp',
            leftBipedSlot: '1073741824',
            rightBipedSlot: '16384'
        }
    },
    requiredFiles: function() {
        return ['Ecotone Dual Sheath.esl']
    },
    getFilesToPatch: function(filenames) {
        return filenames.subtract(['Ecotone Dual Sheath.esl']);
    },
    execute: (patchFile, helpers, settings, locals) => ({ 
        customProgress: function(filesToPatch) {
            return 100;
        },
        initialize: function() {
            const skyrim = xelib.FileByName('Skyrim.esm');
            const handle = xelib.FileByName('Ecotone Dual Sheath.esl');

            const weapons = helpers.loadRecords('WEAP');
            const armors = helpers.loadRecords('ARMO');
            
            locals = {
                dataPath: xelib.GetGlobal('DataPath'),
                templateARMA: GetRecord(handle, 'ARMA\\ectnDualSheathArmorTemplateAA'),
                templateARMO: GetRecord(handle, 'ARMO\\ectnDualSheathArmorTemplate'),
                keyword: xelib.GetHexFormID(GetRecord(handle, 'KYWD\\ectnDualSheath')),
                keywordShieldOnBackClk: xelib.GetHexFormID(GetRecord(handle, 'KYWD\\ectnDualSheathShieldOnBackClk')),
                keywordShieldOnBack: xelib.GetHexFormID(GetRecord(handle, 'KYWD\\ectnDualSheathShieldOnBack')),
                keywordRightStaff: xelib.GetHexFormID(GetRecord(handle, 'KYWD\\ectnDualSheathRightStaff')),
                keywordLeftStaff: xelib.GetHexFormID(GetRecord(handle, 'KYWD\\ectnDualSheathLeftStaff')),
                keywordLeftSheath: xelib.GetHexFormID(GetRecord(handle, 'KYWD\\ectnDualSheathLeftSheath')),
                keywordLeftWeapon: xelib.GetHexFormID(GetRecord(handle, 'KYWD\\ectnDualSheathLeftWeapon')),
                keywordArmorShield: xelib.GetHexFormID(GetRecord(skyrim, 'KYWD\\ArmorShield'))
            }

            locals.jsonData = {
                "Setting": {
                    "leftBipedSlotID": settings.leftBipedSlot,
                    "rightBipedSlotID": settings.rightBipedSlot,
                    "PatchFileName": settings.patchFileName,
                    "TotalRecords": 0            
                },
                "FormsMap": {
                    "__metaInfo": {
                        "typeName": "JFormMap"
                    }
                }
            }

            helpers.logMessage(`Ecotone Dual Sheath: Processing weapon records...`);

            weapons.forEach(record => {
                helpers.addProgress(50/weapons.length);

                if (!IsUsable(record))
                    return;

                const type = xelib.GetValue(record, 'ETYP');
                if (type == 'BothHands [EQUP:00013F45]')
                    return;

                const animation = xelib.GetValue(record, 'DNAM\\Animation Type');
                switch (animation) {
                    case 'OneHandSword':
                    case 'OneHandAxe':
                    case 'OneHandMace':
                    case 'OneHandDagger':
                        AddWeapon(patchFile, helpers, settings, locals, record);
                        break;
                    case 'Staff':
                        AddStaff(patchFile, helpers, settings, locals, record);
                        break;
                    default:
                        return;
                }
            });

            helpers.logMessage(`Ecotone Dual Sheath: Processing armor records...`);
            
            armors.forEach(record => {
                helpers.addProgress(50/armors.length);

                if (!IsUsable(record, true))
                    return;

                const flag = xelib.GetFlag(record, 'BOD2\\First Person Flags', '39 - Shield');
                if (!flag)
                    return;

                const keyword = xelib.HasKeyword(record, locals.keywordArmorShield);
                if (!keyword)
                    return;

                AddShield(patchFile, helpers, settings, locals, record);
            });
            
            helpers.logMessage(`Ecotone Dual Sheath: Finished`);

            locals.jsonData["Setting"]["TotalRecords"] = xelib.GetRecordCount(patchFile);

            fh.saveJsonFile(fh.path(locals.dataPath, 'Ecotone Dual Sheath Patch.json'), locals.jsonData);
            
        },
        process: []
    })
});