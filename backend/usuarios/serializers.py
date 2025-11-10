from rest_framework import serializers
from .models import Usuario, Rol

class UserLoginSerializer(serializers.ModelSerializer):
    rol_nombre = serializers.ReadOnlyField(source='rol.nombre')
    
    class Meta:
        model = Usuario
        fields = ['id', 'username', 'email', 'rol', 'rol_nombre', 'first_name', 'last_name']


class RegistroSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = Usuario
        fields = ['username', 'email', 'password', 'first_name', 'last_name', 'telefono']
    
    def create(self, validated_data):
        username = validated_data.pop('username')
        password = validated_data.pop('password')
        
        user = Usuario.objects.create_user(
            username=username,
            password=password,
            email=validated_data.get('email', ''),
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            telefono=validated_data.get('telefono', '')
        )
        
        try:
            rol_cliente = Rol.objects.get(id=4)
            user.rol = rol_cliente
            user.save()
        except Rol.DoesNotExist:
            print("ADVERTENCIA: Rol 'Cliente' (ID 4) no encontrado.")

        return user



class ProfileSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = Usuario
        fields = ['username', 'email', 'first_name', 'last_name', 'telefono']
        read_only_fields = ['username']