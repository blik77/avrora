from django.db import models
from django.contrib.auth.models import User
from datetime import datetime

class AccessLevel(models.Model):
    class Meta:
        verbose_name = 'Уровень доступа'
        verbose_name_plural = 'Уровни доступа'
    
    name = models.TextField()

    def __str__(self):
        return self.name[:50]

class Organization(models.Model):
    class Meta:
        verbose_name = 'Организация'
        verbose_name_plural = 'Организации'

    name = models.TextField()

    def __str__(self):
        return self.name[:50]

class UserData(models.Model):
    class Meta:
        verbose_name = 'Настройка пользователя'
        verbose_name_plural = 'Настройки пользователей'

    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key = True)
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    patronymic = models.CharField(max_length=50, blank=True)
    city = models.CharField(max_length=50)
    organization = models.ForeignKey(Organization, on_delete=models.PROTECT, null=True)
    telephone = models.CharField(max_length=50)
    access_level = models.ForeignKey(AccessLevel, on_delete=models.PROTECT)
    email = models.CharField(max_length=100, blank=True)
    send_alert = models.BooleanField(default=False)

    def __str__(self):
        return '{} {} {}'.format(self.first_name, self.last_name, self.patronymic)

class Device(models.Model):
    class Meta:
        verbose_name = 'Девайс'
        verbose_name_plural = 'Девайсы'

    id = models.IntegerField(primary_key=True, editable=False)
    key = models.CharField(max_length=50, unique=True)
    city = models.CharField(max_length=50, default='', blank=True)
    organization = models.ForeignKey(Organization, on_delete=models.PROTECT, null=True)
    address = models.CharField(max_length=100, default='', blank=True)
    telephone = models.CharField(max_length=50, default='', blank=True)
    active = models.BooleanField(default=True)
    approve = models.BooleanField(default=False)

    def __str__(self):
        return '({}) {} [{}]'.format(self.id, self.city, self.organization)

class DeviceData(models.Model):
    class Meta:
        verbose_name = 'Данные девайса'
        verbose_name_plural = 'Данные девайсов'

    device = models.OneToOneField(Device, on_delete=models.CASCADE, primary_key = True, editable=False)
    status = models.IntegerField()
    ac_power = models.BooleanField(default=True)
    led_ok = models.BooleanField(default=True)
    temperature = models.IntegerField()
    angle_x = models.IntegerField()
    angle_y = models.IntegerField()
    latitude = models.FloatField()
    longitude = models.FloatField()
    battery = models.IntegerField()
    uptime = models.IntegerField()
    date_upd = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.device.__str__()
