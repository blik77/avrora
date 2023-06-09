from django.urls import path

from .views import *
from .rest import *
 
urlpatterns = [
    path('', MainPageView.as_view(), name='main_page'),
    path(r'GetDeviceList', GetDeviceList.as_view(), name='GetDeviceList'),
    path(r'GetUserList', GetUserList.as_view(), name='GetUserList'),
    path(r'SetDeviceData', SetDeviceData.as_view(), name='SetDeviceData'),
    path(r'GetDeviceData', GetDeviceData.as_view(), name='GetDeviceData')
]
