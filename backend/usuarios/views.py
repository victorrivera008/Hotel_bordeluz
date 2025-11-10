from django.contrib.auth import authenticate
from rest_framework import views, response, status, exceptions, permissions
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer 

from .serializers import RegistroSerializer, ProfileSerializer, UserLoginSerializer 
from .models import Usuario 




class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Serializador modificado para añadir el 'rol' al payload del token.
    Contiene el FIX para permitir login a usuarios no-staff (soluciona el 401).
    """
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['user_id'] = user.id
        token['rol'] = user.rol.nombre if user.rol else 'No Role' 
        return token

    def validate(self, attrs):
        """
        Sobrescribe el método validate para usar 'authenticate' sin requerir 'is_staff=True'.
        """
        authenticate_kwargs = {
            'username': attrs['username'], 
            'password': attrs['password']
        }
        
        user = authenticate(**authenticate_kwargs)

        if user is None:
            raise exceptions.AuthenticationFailed(
                'No se encontró una cuenta activa con las credenciales proporcionadas.', 
                code='no_account'
            )

        if not user.is_active:
            raise exceptions.AuthenticationFailed(
                'Esta cuenta está inactiva.', 
                code='inactive_account'
            )
        
        refresh = self.get_token(user)
        data = {}
        data['refresh'] = str(refresh)
        data['access'] = str(refresh.access_token)
        
        data['user_id'] = user.id
        data['rol'] = user.rol.nombre if user.rol else 'No Role'

        return data

class CustomTokenObtainPairView(TokenObtainPairView):
    """Vista que utiliza el serializador modificado para el login."""
    serializer_class = CustomTokenObtainPairSerializer



class RegistroUsuarioAPIView(views.APIView):
    """Permite el registro de nuevos usuarios con rol 'Cliente'."""
    permission_classes = [permissions.AllowAny] 

    def post(self, request):
        serializer = RegistroSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            response_data = RegistroSerializer(user).data
            return response.Response(response_data, status=status.HTTP_201_CREATED)
        
        return response.Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ProfileView(views.APIView):
    """Permite a los usuarios (autenticados) ver y actualizar su perfil."""
    permission_classes = [permissions.IsAuthenticated] 

    def get(self, request):
        """Devuelve los datos del usuario actual."""
        serializer = ProfileSerializer(request.user)
        return response.Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request):
        """Actualiza los datos del usuario actual."""
        user = request.user
        serializer = ProfileSerializer(user, data=request.data, partial=True) 
        
        if serializer.is_valid():
            serializer.save()
            return response.Response(serializer.data, status=status.HTTP_200_OK)
        
        return response.Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)