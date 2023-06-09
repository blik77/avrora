
from django.http import HttpResponse, JsonResponse
from django.views import View
from django.views.generic import TemplateView
from .models import *
 
class MainPageView(TemplateView):
    template_name = 'main.html'

class GetDeviceList(View):
    """ Класс получения списка девайсов """

    def post(self, request):
        try:
            user_data = UserData.objects.filter(user=request.user.id)
            if user_data.count() == 0:
                return JsonResponse({'status': 'NO', 'err': 'Пользователь не зарегистрирован в системе для просмотра девайсов!'}, safe=False)
            else:
                user_data = user_data.first()
            only_alert = request.POST.get('only_alert') == 'true'
            ans_data = []
            if user_data.access_level.id == 1:
                data = list(Device.objects.values("id", "city", "organization__name", "address", "telephone"))
            else:
                data = list(Device.objects.filter(organization=user_data.organization).values("id", "city", "organization__name", "address", "telephone"))
            for el in data:
                device_data = DeviceData.objects.get(device_id=el["id"])
                el["status"] = device_data.status
                el["ac_power"] = device_data.ac_power
                el["led_ok"] = device_data.led_ok
                el["temperature"] = device_data.temperature
                el["angle_x"] = device_data.angle_x
                el["angle_y"] = device_data.angle_y
                el["latitude"] = device_data.latitude
                el["longitude"] = device_data.longitude
                el["battery"] = device_data.battery
                el["uptime"] = device_data.uptime
                if only_alert:
                    if getAlertDevice(el):
                        ans_data.append(el)
                else:
                    ans_data.append(el)
            return JsonResponse({'status': 'OK', 'data': ans_data}, safe=False)
        except Exception as exc:
            return JsonResponse({'status': 'NO', 'err': str(exc)}, safe=False)

def getAlertDevice(device):
    """ Функция определения аварийности девайса """

    if device["battery"] <= 15:
        return True
    else:
        return False

class GetUserList(View):
    """ Класс получения списка девайсов """

    def post(self, request):
        try:
            data = list(UserData.objects.values())
            return JsonResponse(data, safe=False)
        except Exception as exc:
            return JsonResponse({'status': 'NO', 'err': str(exc)}, safe=False)

class GetDeviceData(View):
    """ Класс получения данных для девайсов """

    def post(self, request):
        try:
            user_data = UserData.objects.filter(user=request.user.id)
            if user_data.count() == 0:
                return JsonResponse({'status': 'NO', 'err': 'Пользователь не зарегистрирован в системе для просмотра девайсов!'}, safe=False)
            else:
                user_data = user_data.first()
            if user_data.access_level.id == 1:
                devices = list(DeviceData.objects.values())
                return JsonResponse({'status': 'OK', 'data': devices}, safe=False)
            else:
                devices = list(DeviceData.objects.filter(device__organization=user_data.organization).values())
                return JsonResponse({'status': 'OK', 'data': devices}, safe=False)
        except Exception as exc:
            return JsonResponse({'status': 'NO', 'err': str(exc)}, safe=False)
