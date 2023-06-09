from django.contrib import admin

from .models import *

class AccessLevelAdmin(admin.ModelAdmin):
    model = AccessLevel
    list_display = ('id', 'name')
    ordering = ("id",)
admin.site.register(AccessLevel, AccessLevelAdmin)

class UserDataAdmin(admin.ModelAdmin):
    model = UserData
    list_display = ('first_name', 'last_name', 'patronymic', 'city', 'organization', 'telephone',
        'access_level')
    search_fields = ['first_name', 'last_name']
    ordering = ("first_name",)
admin.site.register(UserData, UserDataAdmin)

class DeviceAdmin(admin.ModelAdmin):
    model = Device
    list_display = ('id', 'key', 'city', 'organization', 'address', 'telephone', 'active', 'approve')
    search_fields = ['city', 'organization', 'address']
admin.site.register(Device, DeviceAdmin)

class DeviceDataAdmin(admin.ModelAdmin):
    model = DeviceData
    list_display = ('device', 'status', 'ac_power', 'led_ok', 'temperature', 'angle_x', 'angle_y',
        'latitude', 'longitude', 'battery', 'uptime', 'date_upd')
    search_fields = ['device']
    ordering = ("device",)
admin.site.register(DeviceData, DeviceDataAdmin)

class OrganizationAdmin(admin.ModelAdmin):
    model = Organization
    list_display = ('id', 'name')
    ordering = ("id",)
admin.site.register(Organization, OrganizationAdmin)
