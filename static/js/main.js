var mainPanel, map;
Ext.tip.QuickTipManager.init();
Ext.Date.defaultFormat = 'd.m.Y';
Ext.onReady(function(){
    Ext.Ajax.on('beforerequest', function(conn,opt){ Ext.getBody().mask("Загрузка"); }, Ext.getBody());
    Ext.Ajax.on('requestcomplete', function(){ Ext.getBody().unmask(); } ,Ext.getBody());
    Ext.Ajax.on('requestexception', function(){ Ext.getBody().unmask(); }, Ext.getBody());
    viewPage();
});

function getCookie(name) {
    /* Функция получения из cookie параметров */
    let matches = document.cookie.match(new RegExp(
        "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ));
    return matches ? decodeURIComponent(matches[1]) : undefined;
}

function createLeftPanel(){
    return Ext.create('Ext.grid.Panel', {
        title: 'Меню',
        width: 200,
        region: 'west',
        hideHeaders: true,
        collapsible: true,
        split: true,
        store: Ext.create('Ext.data.Store', {
            fields: ['id', 'name'],
            data: [
                {'id': 1, 'name': 'Карта с девайсами'},
                {'id': 2, 'name': 'Девайсы (таблица)'},
                {'id': 3, 'name': 'Настройки'}
            ]
        }),
        columns: [{ text: 'name', dataIndex: 'name', menuDisabled: true, flex: 1 }],
        listeners: {
            selectionchange: (selModel, selected) => {
                mainPanel.centerPanel.setHtml('');
                mainPanel.centerPanel.removeAll();
                if(selected[0].id === 1){
                    createMap();
                } else if(selected[0].id === 2){
                    createDeviceAlert();
                } else if(selected[0].id === 3){
                    createSettings();
                }
            }
        }
    });
}

function createCenterPanel(){
    return Ext.create('Ext.Panel', {
        border: 0,
        region: 'center',
        layout: 'border'
    });
}

function viewPage(){
    let leftPanel = createLeftPanel();
    let centerPanel = createCenterPanel();
    
    mainPanel = Ext.create('Ext.Panel', {
        tbar: [
            '->', {
                text: 'Admin',
                iconCls: 'fas fa-tools',
                border: 1,
                style: { borderColor: 'red', borderStyle: 'solid' },
                handler: () => { window.open('/admin/', '_blank'); }
            }, {
                text: 'Выход',
                iconCls: 'fas fa-sign-out-alt',
                border: 1,
                style: { borderColor: 'red', borderStyle: 'solid' },
                handler: () => { location.href = '/accounts/logout/'; }
            }
        ],
        layout: 'border',
        leftPanel: leftPanel,
        centerPanel: centerPanel,
        items: [leftPanel, centerPanel]
    });
    
    Ext.create('Ext.container.Viewport', { items: [mainPanel], layout: 'fit' });
    leftPanel.getSelectionModel().select(0);
}

function createMap(){
    mainPanel.centerPanel.setHtml('<div id="map" style="width: 100%; height: 100%; border: 1px solid #99bce8;"></div>');
    ymaps.ready(initYMaps);
    function initYMaps(){
        map = new ymaps.Map("map", {
            center: [55.708562, 37.653768],
            zoom: 5,
            controls: ['zoomControl']
        });
        drawDevice();
    }
}

function drawDevice(){
    map.geoObjects.removeAll();
    Ext.Ajax.request({
        url: 'GetDeviceData',
        method: 'POST',
        params: { csrfmiddlewaretoken: getCookie('csrftoken') },
        success: function(response){
            ans = JSON.parse(response.responseText);
            if(ans.status === 'NO'){
                Ext.Msg.alert('Предупреждение', ans.err);
            } else {
                if(ans.data.length < 1){
                    Ext.Msg.alert('Предупреждение', 'Нет данных для отображения!');
                } else {
                    ans.data.forEach(function(item,i,arr){
                        map.geoObjects.add(buildPlacemark(item));
                    });
                }
            }
        },
        failure: function(response){ Ext.Msg.alert('Ошибка', 'Передача данных не состоялась, попробуйте ещё раз.'); }
    });
}

function buildPlacemark(device){
    return new ymaps.Placemark(
        [device.latitude, device.longitude], {
            // всплывающая подсказка
            hintContent: device.device_id,
            iconContent: device.device_id,
            // Содержимое балуна
            balloonContent: '<strong>' + device.device_id + '</strong><br/>' +
                'status: ' + device.status + '<br/>' +
                'ac_power: ' + device.ac_power + '<br/>' +
                'led_ok: ' + device.led_ok + '<br/>' +
                'temperature: ' + device.temperature + '<br/>' +
                'angle_x: ' + device.angle_x + '<br/>' +
                'angle_y: ' + device.angle_y + '<br/>' +
                'battery: ' + device.battery + '<br/>' +
                'uptime: ' + device.uptime + '<br/>'
        }, { preset: 'islands#' + getAlertDevice(device) }
    );
}

function getAlertDevice(device){
    if(device.battery <= 15){
        return "redIcon";
    }
    return "darkGreenIcon";
}

function createDeviceAlert(){
    let grid_device;
    let only_alert = Ext.create('Ext.form.field.Checkbox', {
        boxLabel: 'Только с Alert',
        checked: true,
        listeners: {
            'change': function(cb, nv){
                GetDeviceList(grid_device, nv)
            }
        }
    });
    grid_device = Ext.create('Ext.grid.Panel', {
        region: 'center',
        tbar: [only_alert],
        store: Ext.create('Ext.data.JsonStore', {
            fields:['city', 'organization__name', 'address', 'telephone']
        }),
        columns: [
            {text: 'Организация', dataIndex: 'organization__name', menuDisabled: true, flex: 1},
            {text: 'Город', dataIndex: 'city', menuDisabled: true, flex: 1},
            {text: 'Адрес', dataIndex: 'address', menuDisabled: true, flex: 1},
            {text: 'Телефон', dataIndex: 'telephone', menuDisabled: true, flex: 1}
        ],
        plugins: [{
            ptype: 'rowexpander',
            rowBodyTpl : new Ext.XTemplate(
                '<p><b>status:</b> {status}</p>',
                '<p><b>ac_power:</b> {ac_power}</p>',
                '<p><b>led_ok:</b> {led_ok}</p>',
                '<p><b>temperature:</b> {temperature}</p>',
                '<p><b>angle_x:</b> {angle_x}</p>',
                '<p><b>angle_y:</b> {angle_y}</p>',
                '<p><b>latitude:</b> {latitude}</p>',
                '<p><b>longitude:</b> {longitude}</p>',
                '<p><b>battery:</b> {battery}</p>',
                '<p><b>uptime:</b> {uptime}</p>'
            )
        }]
    });
    mainPanel.centerPanel.add(grid_device);
    GetDeviceList(grid_device, only_alert.getValue());
}

function GetDeviceList(grid_device, only_alert){
    Ext.Ajax.request({
        url: 'GetDeviceList',
        method: 'POST',
        params: { csrfmiddlewaretoken: getCookie('csrftoken'), only_alert: only_alert },
        success: function(response){
            ans = JSON.parse(response.responseText);
            if(ans.status === 'NO'){
                Ext.Msg.alert('Предупреждение', ans.err);
            } else {
                grid_device.getStore().loadData(ans.data);
            }
        },
        failure: function(response){ Ext.Msg.alert('Ошибка', 'Передача данных не состоялась, попробуйте ещё раз.'); }
    });
}

function createSettings(){
    let grid_user = Ext.create('Ext.grid.Panel', {
        region: 'center',
        store: Ext.create('Ext.data.JsonStore', {
            autoLoad: true,
            proxy: {
                type: 'ajax',
                url: 'GetUserList',
                actionMethods: { read: 'POST' },
                extraParams: { csrfmiddlewaretoken: getCookie('csrftoken') }
            },
            fields:['user_id', 'first_name', 'last_name', 'patronymic', 'city', 'organization', 'telephone', 'access_level_id']
        }),
        columns: [
            {text: 'Имя', dataIndex: 'first_name', menuDisabled: true, flex: 1},
            {text: 'Фамилия', dataIndex: 'last_name', menuDisabled: true, flex: 1},
            {text: 'Отчество', dataIndex: 'patronymic', menuDisabled: true, flex: 1},
            {text: 'Город', dataIndex: 'city', menuDisabled: true, flex: 1},
            {text: 'Организация', dataIndex: 'organization', menuDisabled: true, flex: 1},
            {text: 'Телефон', dataIndex: 'telephone', menuDisabled: true, flex: 1},
            {text: 'Уровень доступа', dataIndex: 'access_level_id', menuDisabled: true, flex: 1}
        ],
    });
    let grid_device = Ext.create('Ext.grid.Panel', {
        region: 'west',
        flex: 1,
        split: true,
        store: Ext.create('Ext.data.JsonStore', {
            autoLoad: true,
            proxy: {
                type: 'ajax',
                url: 'GetDeviceList',
                actionMethods: { read: 'POST' },
                extraParams: { csrfmiddlewaretoken: getCookie('csrftoken') }
            },
            fields:['id', 'city', 'organization', 'address', 'telephone', 'active']
        }),
        columns: [
            {text: 'Город', dataIndex: 'city', menuDisabled: true, flex: 1},
            {text: 'Организация', dataIndex: 'organization', menuDisabled: true, flex: 1},
            {text: 'Адрес', dataIndex: 'address', menuDisabled: true, flex: 1},
            {text: 'Телефон', dataIndex: 'telephone', menuDisabled: true, flex: 1},
            {text: 'active', dataIndex: 'active', menuDisabled: true, flex: 1}
        ],
    });
    mainPanel.centerPanel.add(grid_user, grid_device);
}
